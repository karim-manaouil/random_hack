#include <immintrin.h>
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <errno.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <time.h>
#include <unistd.h>

int     make_floatf(char *, int);
float   avx_sfadd(char*);

char    error_buf[1024];

#define PERROR()                            \
    do {                                    \
        strerror_r(errno, error_buf, 1024); \
        printf("Error: %s\n", error_buf);   \
        fclose(fp);                         \
        return -1;                          \
    } while(0)    

int make_floatf(char *filename, int nblocks)
{
    FILE *fp = NULL;

    if(!(fp = fopen(filename, "wb+")))
        PERROR();

    float *block_ptr = malloc(sizeof(float) * 128);  /* 512 Bytes block of 128 floats */
    if(!block_ptr)
        PERROR();

    int j, i;

    for(j = 0; j < nblocks; j++)
    {
        for(i = 0; i < 128; i++)
            block_ptr[i] = 1.0;
        
        int ret = fwrite(block_ptr, sizeof(float), 128, fp);
        if(ret < 128)
        {
            free(block_ptr);
            PERROR();
        }
    }

    /* 
     * Adding a random number of floats at the end 
     * of file. Number is little to a complete block. 
     *
     */
     
    time_t time_cal = time(NULL);
    srand(gmtime(&time_cal)->tm_sec);

    int max = rand() % 128;

    printf("nrandom:%d\n", max);

    for(i = 0; i < max; i++)
        block_ptr[i] = 1.0;

    int ret = fwrite(block_ptr, sizeof(float), max, fp);
    if(ret < max)
        PERROR();


    free(block_ptr);
    fclose(fp); 

    return 0;
}

float avx_sfadd(char *filename)
{
    FILE *fp = NULL;

    __m256  v1;
    __m256  v2;
    __m256  sum = _mm256_setzero_ps();

    if(!(fp = fopen(filename, "rb")))
       PERROR();

    struct stat stat_buf;
    stat(filename, &stat_buf);
  
    char SHIFT_BITS;

    switch (sizeof(float))
    {
        case 4:
            SHIFT_BITS = 2;
            break;
        case 8:
            SHIFT_BITS = 3;
            break;
        default:
            SHIFT_BITS = 0;
    }

    size_t fsize     = stat_buf.st_size;
    size_t nfloats   = fsize >> SHIFT_BITS;
    size_t nblocks   = nfloats >> 7; // 128 = 2^7 floats per block  
    size_t rem_floats = nfloats & 0x7F; // low order 7-bits left (remainder)

    printf("File size: %ld\nnblocks:%ld\nnremfloats: %ld\n",\
            fsize, nblocks, rem_floats); 

    float *block_ptr = malloc(sizeof(float) * 128);
    if(!block_ptr)
        PERROR();

    int i;
    for(i = 0; i < nblocks; i++)
    {
        int ret = fread(block_ptr, sizeof(float), 128, fp);
        if(ret < 128)
            PERROR();   
        
        int j;
        for(j = 0; j < 16; j += 2)
        {
            v1 = _mm256_loadu_ps(block_ptr + j*8);
            v2 = _mm256_loadu_ps(block_ptr + (j+1)*8);
            
            sum += _mm256_add_ps(v1, v2);
        } 
    }

    float rem_sum = 0;
    if(rem_floats > 0)
    {
        int ret = fread(block_ptr, sizeof(float), rem_floats, fp);
        if(ret < rem_floats)
            PERROR();

        int j;
        for(j = 0; j < rem_floats; j++)
            rem_sum += block_ptr[j];
    }

    float final_sum = rem_sum;
    float *sum_ptr = (float*)&sum;
    
    int k;
    for(k = 0; k < 8; k++)
        final_sum += sum_ptr[k];

    free(block_ptr);
    fclose(fp);

    return final_sum;
}


float loop_sfadd(char *filename)
{
    FILE *fp = NULL;

    if(!(fp = fopen(filename, "rb")))
       PERROR();

    struct stat stat_buf;
    stat(filename, &stat_buf);
   
    size_t fsize     = stat_buf.st_size;
    size_t nblocks   = fsize / (sizeof(float) * 128); 
    size_t rem_size  = fsize - nblocks * sizeof(float) * 128;
    size_t rem_floats = rem_size / (sizeof(float));

    printf("File size: %ld\nnblocks:%ld\nnremfloats: %ld\n",\
            fsize, nblocks, rem_floats); 

    float *block_ptr = malloc(sizeof(float) * 128);
    if(!block_ptr)
        PERROR();
    
    float sum = 0;

    int i;
    for(i = 0; i < nblocks; i++)
    {
        int ret = fread(block_ptr, sizeof(float), 128, fp);
        if(ret < 128)
            PERROR();   
        
        int j;
        for(j = 0; j < 128; j++)
        {
            sum += block_ptr[j];             
        } 
    }

    float rem_sum = 0;
    if(rem_size > 0)
    {
        int ret = fread(block_ptr, 1, rem_size, fp);
        if(ret < rem_floats)
            PERROR();

        int j;
        for(j = 0; j < rem_floats; j++)
            rem_sum += block_ptr[j];
    }

    float final_sum = sum + rem_sum;
    
    free(block_ptr);
    fclose(fp);

    return final_sum;
}


int main(int argc, char **argv)
{
    if(argc < 2){
        puts("./main filename [nblocks]");
        return 0;
    }

    else if(argc == 3){
        
        if(!make_floatf(argv[1], atoi(argv[2])))
            puts("File has been created sucessfully\n");
    }

    else 
        strstr(argv[1], "avx") ? \
            printf("avx_sum = %f\n", avx_sfadd(argv[1])) :
                printf("loop_sum = %f\n", loop_sfadd(argv[1]));

    return 0;
}

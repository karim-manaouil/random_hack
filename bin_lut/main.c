#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include "bins_luc.h"

#define length(v)   (sizeof(v)/sizeof(v[0]))

static inline void print_lut_map (lut *map, int n);

int 
main(int argc, char **argv)
{
    u32 vector[] = {10, 101, 5789,
                    10 | 1 << 16, 101 | 1 << 16,
                    10 | 2 << 16, 
                    10 | 4 << 16, 101 | 4 << 16, 5789 | 4 << 16,
                    10 | 5 << 16, 101 | 5 << 16,
                    10 | 6 << 16,
                    10 | 7 << 16, 101 | 7 << 16 };

    lut map[1 << 16] = {0};

    if (argc < 2) 
    {
        puts ("./%s with-debug|no-debug n");
        return -1;
    }

    init_lut_map (map, vector, length (vector));

    if (!strcmp (argv[1], "with-debug"))
        print_lut_map (map, argc > 2 ? atoi(argv[2]) : 10);


    u32 key;

    while (1) 
    {
        printf ("key?");
        scanf ("%d", &key);
        
        if (!key) 
            break;

        i64 idx = lut_bins (vector, map, key); // Find the key 
        
        idx == -1 ? puts ("Not found!\n") : \
          printf ("vector[%d] = %d\n", idx, key);   
    }
}

static inline void 
print_lut_map (lut *map, int n)
{
    for (int i = 0; i < n; i++)
        printf ("map[%d] = {%d, %d}\n", \
                i, map[i].beg, map[i].end);
}

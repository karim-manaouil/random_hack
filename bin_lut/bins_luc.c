#include "bins_luc.h"
#include <stdio.h>
/* code */

i64 
bin_search (u32 *vector, u32 key, u32 start, u32 end)
{
    i64 s = start, m, e = end;

    while ( s <= e )
    {
        m = (s + e) >> 1;
        
        if (key == vector[m])
            return m;
        
        else if (key > vector[m])
            s = m + 1;
        
        else 
            e = m - 1; 
    }

    return -1;
}

u32
init_lut_map (lut *map, u32 *vector, u32 length)
{
    u32 prev     = 0;
    u32 lut_i    = 0;
    u32 idx      = 0;

    u32 lut_i_max = lut_i << 16 | 0xffff;
    
    while (idx < length)
    {
        if (vector[idx] > lut_i_max)
        {
            map[lut_i].beg = prev;
            map[lut_i].end = idx;
            
            prev = idx;
            lut_i++;
            lut_i_max = lut_i << 16 | 0xffff;
        } 
        else
        {
            idx++;
        } 

    }
}

inline i64 
lut_bins (u32 *vector, lut *map, u32 key)
{
    lut range = map[key >> 16];
        
    printf ("range=[%d, %d]\n", range.beg, range.end);

    return 
        bin_search (vector, key, range.beg, range.end);
}





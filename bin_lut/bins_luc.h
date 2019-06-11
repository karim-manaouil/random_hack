#ifndef BINS_LUC
# define BINS_LUC

#include <stdint.h>

#define u32 uint32_t
#define i64 int64_t

/* types */
typedef struct {
        u32 beg;
            u32 end;
} lut;


/* Interface */
i64 bin_search (u32 *vector, u32 key, u32 start, u32 end);
i64 lut_bins (u32 *vector, lut *map, u32 key);
u32 init_lut_map (lut *map, u32 *vector, u32 length);


#endif

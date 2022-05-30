#include <stdio.h>
#include <stdint.h>
#include <string.h>

typedef struct
{
    uint8_t  id[4];
    uint32_t num_lumps;
    uint32_t directory_offset;
} Header;


int main()
{
    FILE * wad = fopen("../wads/DOOM.WAD", "r");
    
    if ( wad == NULL ) {
        puts("couldn't open wad");
        return 1;
    }
    
    Header header;
    fread(&header, 12, 1, wad);
    fclose(wad);
    
    char id_string[5];
    memcpy(id_string, header.id, 4);
    id_string[4] = 0;
    
    printf("Header:\n");
    printf("- id: %s\n", id_string);
    printf("- number of lumps: %d\n", header.num_lumps);
    printf("- directory offset: 0x%X\n", header.directory_offset);
    
    return 0;
}

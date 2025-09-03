#include <stdio.h>
#include <stdlib.h>

int main() {
    FILE* file = fopen("test.bmp", "wb");
    
    // Create a simple 100x100 red image
    int width = 100, height = 100;
    int padding = (4 - (width * 3) % 4) % 4;
    int image_size = (width * 3 + padding) * height;
    
    // BMP Header
    unsigned char header[54] = {
        'B', 'M',  // Signature
        54 + image_size, 0, 0, 0,  // File size
        0, 0, 0, 0,  // Reserved
        54, 0, 0, 0,  // Data offset
        40, 0, 0, 0,  // Info header size
        width, 0, 0, 0,  // Width
        height, 0, 0, 0,  // Height
        1, 0,  // Planes
        24, 0,  // Bits per pixel
        0, 0, 0, 0,  // Compression
        image_size, 0, 0, 0,  // Image size
        0, 0, 0, 0,  // X pixels per meter
        0, 0, 0, 0,  // Y pixels per meter
        0, 0, 0, 0,  // Colors used
        0, 0, 0, 0   // Colors important
    };
    
    fwrite(header, 1, 54, file);
    
    // Write red pixels
    for (int y = 0; y < height; y++) {
        for (int x = 0; x < width; x++) {
            fputc(0, file);    // Blue
            fputc(0, file);    // Green  
            fputc(255, file);  // Red
        }
        for (int p = 0; p < padding; p++) {
            fputc(0, file);
        }
    }
    
    fclose(file);
    printf("Created test.bmp\n");
    return 0;
}
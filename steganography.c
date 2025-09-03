#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    unsigned char r, g, b, a;  // Added alpha channel
} Pixel;

typedef struct {
    int width, height;
    Pixel *data;
} Image;

// BMP header structures
#pragma pack(push, 1)
typedef struct {
    char signature[2];
    unsigned int file_size;
    unsigned int reserved;
    unsigned int data_offset;
} BMPHeader;

typedef struct {
    unsigned int header_size;
    int width;
    int height;
    unsigned short planes;
    unsigned short bits_per_pixel;
    unsigned int compression;
    unsigned int image_size;
    int x_pixels_per_meter;
    int y_pixels_per_meter;
    unsigned int colors_used;
    unsigned int colors_important;
} BMPInfoHeader;
#pragma pack(pop)

// Function prototypes
Image* load_bmp(const char* filename);
void save_bmp(const char* filename, Image* img);
void hide_message(Image* img, const char* message);
char* extract_message(Image* img);
void set_lsb(unsigned char* byte, int bit);
int get_lsb(unsigned char byte);

int main(int argc, char* argv[]) {
    if (argc < 3) {
        printf("Usage: %s <hide|extract> <image.bmp> [message]\n", argv[0]);
        return 1;
    }
    
    if (strcmp(argv[1], "hide") == 0) {
        if (argc < 4) {
            printf("Usage: %s hide <image.bmp> <message>\n", argv[0]);
            return 1;
        }
        
        Image* img = load_bmp(argv[2]);
        if (!img) {
            printf("Error loading image\n");
            return 1;
        }
        
        hide_message(img, argv[3]);
        save_bmp("output.bmp", img);
        printf("Message hidden in output.bmp\n");
        
        free(img->data);
        free(img);
    }
    else if (strcmp(argv[1], "extract") == 0) {
        Image* img = load_bmp(argv[2]);
        if (!img) {
            printf("Error loading image\n");
            return 1;
        }
        
        char* message = extract_message(img);
        printf("Hidden message: %s\n", message);
        
        free(message);
        free(img->data);
        free(img);
    }
    else {
        printf("Invalid operation. Use 'hide' or 'extract'\n");
        return 1;
    }
    
    return 0;
}

Image* load_bmp(const char* filename) {
    FILE* file = fopen(filename, "rb");
    if (!file) {
        printf("Error: Cannot open file '%s'\n", filename);
        return NULL;
    }
    
    BMPHeader header;
    BMPInfoHeader info;
    
    if (fread(&header, sizeof(BMPHeader), 1, file) != 1) {
        printf("Error: Cannot read BMP header\n");
        fclose(file);
        return NULL;
    }
    
    if (fread(&info, sizeof(BMPInfoHeader), 1, file) != 1) {
        printf("Error: Cannot read BMP info header\n");
        fclose(file);
        return NULL;
    }
    
    printf("Debug: Signature: %c%c\n", header.signature[0], header.signature[1]);
    printf("Debug: Bits per pixel: %d\n", info.bits_per_pixel);
    printf("Debug: Width: %d, Height: %d\n", info.width, info.height);
    
    if (header.signature[0] != 'B' || header.signature[1] != 'M') {
        printf("Error: Not a valid BMP file\n");
        fclose(file);
        return NULL;
    }
    
    if (info.bits_per_pixel != 24 && info.bits_per_pixel != 32) {
        printf("Error: Only 24-bit and 32-bit BMP files supported\n");
        fclose(file);
        return NULL;
    }
    
    Image* img = malloc(sizeof(Image));
    img->width = info.width;
    img->height = abs(info.height);
    img->data = malloc(img->width * img->height * sizeof(Pixel));
    
    fseek(file, header.data_offset, SEEK_SET);
    
    int bytes_per_pixel = info.bits_per_pixel / 8;
    int padding = (4 - (img->width * bytes_per_pixel) % 4) % 4;
    
    for (int y = 0; y < img->height; y++) {
        for (int x = 0; x < img->width; x++) {
            int index = y * img->width + x;
            fread(&img->data[index].b, 1, 1, file);
            fread(&img->data[index].g, 1, 1, file);
            fread(&img->data[index].r, 1, 1, file);
            if (bytes_per_pixel == 4) {
                fread(&img->data[index].a, 1, 1, file);
            } else {
                img->data[index].a = 255;  // Default alpha
            }
        }
        fseek(file, padding, SEEK_CUR);
    }
    
    fclose(file);
    printf("Successfully loaded BMP: %dx%d (%d-bit)\n", img->width, img->height, info.bits_per_pixel);
    return img;
}

void save_bmp(const char* filename, Image* img) {
    FILE* file = fopen(filename, "wb");
    if (!file) return;
    
    int padding = (4 - (img->width * 3) % 4) % 4;
    int image_size = (img->width * 3 + padding) * img->height;
    
    BMPHeader header = {
        .signature = {'B', 'M'},
        .file_size = sizeof(BMPHeader) + sizeof(BMPInfoHeader) + image_size,
        .reserved = 0,
        .data_offset = sizeof(BMPHeader) + sizeof(BMPInfoHeader)
    };
    
    BMPInfoHeader info = {
        .header_size = sizeof(BMPInfoHeader),
        .width = img->width,
        .height = img->height,
        .planes = 1,
        .bits_per_pixel = 24,
        .compression = 0,
        .image_size = image_size,
        .x_pixels_per_meter = 0,
        .y_pixels_per_meter = 0,
        .colors_used = 0,
        .colors_important = 0
    };
    
    fwrite(&header, sizeof(BMPHeader), 1, file);
    fwrite(&info, sizeof(BMPInfoHeader), 1, file);
    
    for (int y = 0; y < img->height; y++) {
        for (int x = 0; x < img->width; x++) {
            int index = y * img->width + x;
            fwrite(&img->data[index].b, 1, 1, file);
            fwrite(&img->data[index].g, 1, 1, file);
            fwrite(&img->data[index].r, 1, 1, file);
        }
        for (int p = 0; p < padding; p++) {
            fputc(0, file);
        }
    }
    
    fclose(file);
}

void hide_message(Image* img, const char* message) {
    int msg_len = strlen(message);
    int total_pixels = img->width * img->height;
    
    // Now we have 4 channels (RGBA) instead of 3
    if (msg_len * 8 + 32 > total_pixels * 4) {
        printf("Message too long for image\n");
        return;
    }
    
    int bit_index = 0;
    
    // Hide message length first (32 bits)
    for (int i = 0; i < 32; i++) {
        int pixel_index = bit_index / 4;
        int color_channel = bit_index % 4;
        int bit = (msg_len >> (31 - i)) & 1;
        
        unsigned char* byte;
        if (color_channel == 0) byte = &img->data[pixel_index].r;
        else if (color_channel == 1) byte = &img->data[pixel_index].g;
        else if (color_channel == 2) byte = &img->data[pixel_index].b;
        else byte = &img->data[pixel_index].a;
        
        set_lsb(byte, bit);
        bit_index++;
    }
    
    // Hide message
    for (int i = 0; i < msg_len; i++) {
        for (int j = 0; j < 8; j++) {
            int pixel_index = bit_index / 4;
            int color_channel = bit_index % 4;
            int bit = (message[i] >> (7 - j)) & 1;
            
            unsigned char* byte;
            if (color_channel == 0) byte = &img->data[pixel_index].r;
            else if (color_channel == 1) byte = &img->data[pixel_index].g;
            else if (color_channel == 2) byte = &img->data[pixel_index].b;
            else byte = &img->data[pixel_index].a;
            
            set_lsb(byte, bit);
            bit_index++;
        }
    }
}

char* extract_message(Image* img) {
    int bit_index = 0;
    
    // Extract message length
    int msg_len = 0;
    for (int i = 0; i < 32; i++) {
        int pixel_index = bit_index / 4;
        int color_channel = bit_index % 4;
        
        unsigned char byte;
        if (color_channel == 0) byte = img->data[pixel_index].r;
        else if (color_channel == 1) byte = img->data[pixel_index].g;
        else if (color_channel == 2) byte = img->data[pixel_index].b;
        else byte = img->data[pixel_index].a;
        
        int bit = get_lsb(byte);
        msg_len |= (bit << (31 - i));
        bit_index++;
    }
    
    printf("Debug: Extracted message length: %d\n", msg_len);
    
    if (msg_len <= 0 || msg_len > 10000) {
        printf("Debug: Invalid message length, returning default message\n");
        return strdup("No hidden message found");
    }
    
    char* message = malloc(msg_len + 1);
    
    // Extract message
    for (int i = 0; i < msg_len; i++) {
        char ch = 0;
        for (int j = 0; j < 8; j++) {
            int pixel_index = bit_index / 4;
            int color_channel = bit_index % 4;
            
            unsigned char byte;
            if (color_channel == 0) byte = img->data[pixel_index].r;
            else if (color_channel == 1) byte = img->data[pixel_index].g;
            else if (color_channel == 2) byte = img->data[pixel_index].b;
            else byte = img->data[pixel_index].a;
            
            int bit = get_lsb(byte);
            ch |= (bit << (7 - j));
            bit_index++;
        }
        message[i] = ch;
    }
    
    message[msg_len] = '\0';
    printf("Debug: Extracted message: '%s'\n", message);
    return message;
}

void set_lsb(unsigned char* byte, int bit) {
    if (bit) {
        *byte |= 1;  // Set LSB to 1
    } else {
        *byte &= 0xFE;  // Set LSB to 0
    }
}

int get_lsb(unsigned char byte) {
    return byte & 1;
}

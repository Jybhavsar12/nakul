#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to compile the steganography tool
compile_tool() {
    print_status "Compiling steganography tool..."
    gcc steganography.c -o stego
    if [ $? -eq 0 ]; then
        print_success "Compilation successful"
        return 0
    else
        print_error "Compilation failed"
        return 1
    fi
}

# Function to check if web files exist
check_web_files() {
    local missing_files=()
    
    if [ ! -f "index.html" ]; then
        missing_files+=("index.html")
    fi
    
    if [ ! -f "style.css" ]; then
        missing_files+=("style.css")
    fi
    
    if [ ! -f "script.js" ]; then
        missing_files+=("script.js")
    fi
    
    if [ ${#missing_files[@]} -gt 0 ]; then
        print_error "Missing web files: ${missing_files[*]}"
        return 1
    fi
    
    return 0
}

# Function to start web server
start_web_server() {
    print_status "Starting web server..."
    
    # Check if Python 3 is available
    if command -v python3 &> /dev/null; then
        print_success "Starting Python 3 HTTP server on port 8000"
        print_status "Open your browser and go to: http://localhost:8000"
        python3 -m http.server 8000
    # Check if Python 2 is available
    elif command -v python &> /dev/null; then
        print_success "Starting Python 2 HTTP server on port 8000"
        print_status "Open your browser and go to: http://localhost:8000"
        python -m SimpleHTTPServer 8000
    # Check if Node.js is available
    elif command -v node &> /dev/null; then
        print_status "Installing http-server via npm..."
        npm install -g http-server 2>/dev/null
        if [ $? -eq 0 ]; then
            print_success "Starting Node.js HTTP server on port 8000"
            print_status "Open your browser and go to: http://localhost:8000"
            http-server -p 8000
        else
            print_error "Failed to install http-server"
            return 1
        fi
    else
        print_error "No web server available (Python or Node.js required)"
        print_status "Please install Python: sudo apt install python3"
        print_status "Or install Node.js: sudo apt install nodejs npm"
        return 1
    fi
}

# Function to convert image to 24-bit BMP
convert_image() {
    local input_file="$1"
    local output_file="converted_image.bmp"
    
    print_status "Converting $input_file to 24-bit BMP..."
    
    # Check if ImageMagick is installed
    if command -v convert &> /dev/null; then
        convert "$input_file" -type TrueColor -depth 8 "$output_file"
        if [ $? -eq 0 ]; then
            print_success "Image converted to $output_file"
            echo "$output_file"
        else
            print_error "Failed to convert image with ImageMagick"
            return 1
        fi
    # Check if FFmpeg is installed
    elif command -v ffmpeg &> /dev/null; then
        ffmpeg -i "$input_file" -pix_fmt bgr24 "$output_file" -y &> /dev/null
        if [ $? -eq 0 ]; then
            print_success "Image converted to $output_file"
            echo "$output_file"
        else
            print_error "Failed to convert image with FFmpeg"
            return 1
        fi
    else
        print_error "No image conversion tool found (ImageMagick or FFmpeg required)"
        print_status "Please install ImageMagick: sudo apt install imagemagick"
        print_status "Or install FFmpeg: sudo apt install ffmpeg"
        return 1
    fi
}

# Function to hide message
hide_message() {
    local image_file="$1"
    local message="$2"
    
    print_status "Hiding message in $image_file..."
    ./stego hide "$image_file" "$message"
    
    if [ -f "output.bmp" ]; then
        print_success "Message hidden successfully in output.bmp"
    else
        print_error "Failed to hide message"
        return 1
    fi
}

# Function to extract message
extract_message() {
    local image_file="$1"
    
    print_status "Extracting message from $image_file..."
    local full_output=$(./stego extract "$image_file" 2>&1)
    local extracted_message=$(echo "$full_output" | grep "Hidden message:" | cut -d':' -f2- | sed 's/^ *//')
    
    echo "$full_output"  # Show all output for debugging
    
    if [ -n "$extracted_message" ]; then
        print_success "Message extracted successfully!"
        echo -e "${GREEN}Hidden Message:${NC} $extracted_message"
    else
        print_warning "Checking if extraction worked..."
        # If no "Hidden message:" found, show the raw output
        echo -e "${YELLOW}Raw output:${NC} $full_output"
    fi
}

# Main menu
show_menu() {
    echo -e "\n${BLUE}=== Steganography Tool ===${NC}"
    echo "1. Launch Web Interface"
    echo "2. Hide message in image (CLI)"
    echo "3. Extract message from image (CLI)"
    echo "4. Exit"
    echo -n "Choose option (1-4): "
}

# Main script
main() {
    print_status "Initializing Steganography Tool..."
    
    # Check if steganography.c exists
    if [ ! -f "steganography.c" ]; then
        print_error "steganography.c not found in current directory"
        exit 1
    fi
    
    # Compile the C tool
    if [ ! -f "stego" ]; then
        compile_tool || exit 1
    else
        print_status "C tool already compiled"
    fi
    
    while true; do
        show_menu
        read choice
        
        case $choice in
            1)
                print_status "Launching web interface..."
                if check_web_files; then
                    start_web_server
                else
                    print_error "Web files missing. Please ensure index.html, style.css, and script.js are present."
                fi
                ;;
                
            2)
                echo -n "Enter image file path: "
                read image_path
                
                if [ ! -f "$image_path" ]; then
                    print_error "File not found: $image_path"
                    continue
                fi
                
                # Check if it's already a BMP file
                if [[ "$image_path" == *.bmp ]]; then
                    converted_image="$image_path"
                else
                    converted_image=$(convert_image "$image_path")
                    if [ $? -ne 0 ]; then
                        continue
                    fi
                fi
                
                echo -n "Enter message to hide: "
                read message
                
                hide_message "$converted_image" "$message"
                ;;
                
            3)
                echo -n "Enter image file path: "
                read image_path
                
                if [ ! -f "$image_path" ]; then
                    print_error "File not found: $image_path"
                    continue
                fi
                
                # Check if it's already a BMP file
                if [[ "$image_path" == *.bmp ]]; then
                    converted_image="$image_path"
                else
                    converted_image=$(convert_image "$image_path")
                    if [ $? -ne 0 ]; then
                        continue
                    fi
                fi
                
                extract_message "$converted_image"
                ;;
                
            4)
                print_status "Goodbye!"
                exit 0
                ;;
                
            *)
                print_error "Invalid option. Please choose 1-4."
                ;;
        esac
        
        if [ $choice -ne 1 ]; then
            echo -e "\nPress Enter to continue..."
            read
        fi
    done
}

# Run main function
main

# 🔒 Steganography Tool - Hide Secrets in Plain Sight

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![C](https://img.shields.io/badge/C-00599C?style=flat&logo=c&logoColor=white)](https://en.wikipedia.org/wiki/C_(programming_language))
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)

A sophisticated steganography tool that allows you to hide secret messages within BMP images using LSB (Least Significant Bit) encoding. Features both a cyberpunk-themed web interface and command-line functionality.

## ✨ Features

### 🎯 Core Functionality
- **Hide Messages**: Embed secret text into BMP images invisibly
- **Extract Messages**: Retrieve hidden messages from steganographic images
- **LSB Encoding**: Uses industry-standard Least Significant Bit technique
- **BMP Support**: Works with 24-bit BMP image format
- **Automatic Conversion**: Converts other image formats to BMP using ImageMagick/FFmpeg

### 🌐 Web Interface
- **Cyberpunk Design**: Sophisticated Matrix-inspired UI with animations
- **Drag & Drop**: Easy file upload with visual feedback
- **Real-time Preview**: See your images before processing
- **Download Results**: Get your steganographic images instantly
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Advanced Animations**: Matrix rain, glitch effects, and particle systems

### 💻 Command Line Interface
- **Bash Script**: Automated compilation and execution
- **Menu System**: Interactive CLI with colored output
- **Error Handling**: Comprehensive error checking and user feedback
- **Cross-platform**: Works on Linux, macOS, and Windows (with WSL)

## 🚀 Quick Start

### Prerequisites
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install gcc imagemagick python3

# macOS (with Homebrew)
brew install gcc imagemagick python3

# CentOS/RHEL
sudo yum install gcc ImageMagick python3
```

### Installation
```bash
# Clone the repository
git clone https://github.com/Jybhavsar12/steganography-tool.git
cd steganography-tool

# Make the script executable
chmod +x stego_tool.sh

# Run the tool
./stego_tool.sh
```

## 📖 Usage

### 🌐 Web Interface
1. Run `./stego_tool.sh` and select option 1
2. Open your browser to `http://localhost:8000`
3. **Hide Message**: Upload an image, enter your secret message, click "HIDE MESSAGE"
4. **Extract Message**: Upload a steganographic image, click "EXTRACT MESSAGE"

### 💻 Command Line

#### Hide a Message
```bash
# Using the interactive script
./stego_tool.sh

# Direct C program usage
gcc steganography.c -o stego
./stego hide image.bmp "Your secret message"
```

#### Extract a Message
```bash
# Using the interactive script
./stego_tool.sh

# Direct C program usage
./stego extract steganographic_image.bmp
```

## 🏗️ Project Structure

```
steganography-tool/
├── 📄 README.md              # This file
├── 🔧 stego_tool.sh          # Main bash script
├── 💻 steganography.c        # Core C implementation
├── 🌐 index.html             # Web interface
├── 🎨 style.css              # Cyberpunk styling
├── ⚡ script.js              # Web functionality
├── 🧪 create_test_bmp.c      # Test image generator
└── 📁 examples/              # Example images and outputs
```

## 🔬 How It Works

### LSB Steganography
The tool uses **Least Significant Bit (LSB)** steganography:

1. **Encoding**: Replaces the least significant bit of each color channel (RGB) with message bits
2. **Message Format**: Stores message length first, followed by the actual message
3. **Termination**: Uses null terminator to mark message end
4. **Invisibility**: Changes are imperceptible to human eye (±1 color value)

### Technical Details
- **Image Format**: 24-bit BMP (uncompressed)
- **Capacity**: ~3 bits per pixel (1 bit per RGB channel)
- **Max Message**: Depends on image size (Width × Height × 3 bits)
- **Encoding**: ASCII text messages

## 🎨 Web Interface Features

### Cyberpunk Design Elements
- **Matrix Rain**: Animated falling characters background
- **Glitch Effects**: Sophisticated text animations
- **Particle Systems**: Dynamic floating elements
- **Glassmorphism**: Modern blur and transparency effects
- **Responsive Layout**: Mobile-first design approach

### User Experience
- **Drag & Drop**: Intuitive file upload
- **Progress Indicators**: Visual feedback during processing
- **Error Handling**: User-friendly error messages
- **Copy to Clipboard**: Easy message extraction
- **Download Management**: Automatic file naming with timestamps

## 🛠️ Development

### Building from Source
```bash
# Compile the C program
gcc -o stego steganography.c

# Create a test BMP image
gcc -o create_test create_test_bmp.c
./create_test

# Test the functionality
./stego hide test.bmp "Hello, World!"
./stego extract output.bmp
```

### File Dependencies
- **steganography.c**: Core LSB implementation
- **stego_tool.sh**: Wrapper script with menu system
- **index.html**: Web interface structure
- **style.css**: Cyberpunk styling and animations
- **script.js**: Client-side steganography logic

## 🔧 Configuration

### Supported Image Formats
- **Native**: BMP (24-bit)
- **Auto-Convert**: JPG, PNG, GIF, TIFF (requires ImageMagick/FFmpeg)

### Web Server Options
The script automatically detects and uses:
1. **Python 3**: `python3 -m http.server 8000`
2. **Python 2**: `python -m SimpleHTTPServer 8000`
3. **Node.js**: `http-server -p 8000`

## 🚨 Security Considerations

### Important Notes
- **Not Encryption**: Steganography hides data, doesn't encrypt it
- **Detection**: Advanced steganalysis tools can detect LSB steganography
- **File Size**: Steganographic images may have slightly different file sizes
- **Quality**: Use high-quality source images for better results

### Best Practices
- Combine with encryption for sensitive data
- Use images with natural noise/texture
- Avoid suspicious file naming patterns
- Test extraction before sharing steganographic images

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow existing code style
- Add comments for complex logic
- Test both CLI and web interfaces
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **LSB Steganography**: Based on classical steganographic techniques
- **Web Design**: Inspired by cyberpunk and Matrix aesthetics
- **Libraries**: Uses standard C libraries and vanilla JavaScript
- **Tools**: ImageMagick, FFmpeg for image conversion

## 📞 Support

- **Email**: jyotbhavsar2003@gmail.com

## 🔮 Future Enhancements

- [ ] Support for PNG steganography
- [ ] Password-protected messages
- [ ] Batch processing capabilities
- [ ] Advanced steganalysis resistance
- [ ] Mobile app version
- [ ] Docker containerization

---

<div align="center">

**Made with ❤️ for digital privacy and security**


</div>

# Troubleshooting

Common issues and solutions.

## File Reading Issues

### Permission Errors
Check file system permissions for the target directory.

### Encoding Problems
Ensure all markdown files use UTF-8 encoding.

## Parsing Issues

### Malformed Headers
Headers must start with # and include space before title.

### Empty Files
Empty files are skipped during processing.

## Performance

### Large Files
Consider chunking for files over 1MB.

### Memory Usage
Monitor memory with many concurrent file operations.
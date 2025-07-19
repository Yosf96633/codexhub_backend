FROM alpine:latest

# Install git and date/time tools
RUN apk add --no-cache git coreutils

# Set working directory
WORKDIR /app

# Copy your custom script
COPY entrypoint.sh .

# Make it executable
RUN chmod +x entrypoint.sh

# Run script at container startup
CMD ["./entrypoint.sh"]

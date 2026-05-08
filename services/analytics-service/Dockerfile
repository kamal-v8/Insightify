FROM golang:1.25-alpine AS builder
WORKDIR /app
COPY go.mod ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

FROM gcr.io/distroless/static-debian12
WORKDIR /
COPY --from=builder /app/main /main
EXPOSE 8080
CMD ["/main"]

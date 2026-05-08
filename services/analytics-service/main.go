package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
)

type Event struct {
	UserID    string                 `json:"user_id"`
	EventType string                 `json:"event_type"`
	Payload   map[string]interface{} `json:"payload"`
}

var (
	eventCounts = make(map[string]int)
	mu          sync.Mutex
)

func eventsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var event Event
	if err := json.NewDecoder(r.Body).Decode(&event); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	mu.Lock()
	eventCounts[event.EventType]++
	mu.Unlock()

	fmt.Printf("Processed event: %s from user %s\n", event.EventType, event.UserID)
	w.WriteHeader(http.StatusAccepted)
}

func statsHandler(w http.ResponseWriter, r *http.Request) {
	mu.Lock()
	defer mu.Unlock()
	json.NewEncoder(w).Encode(eventCounts)
}

func main() {
	http.HandleFunc("/events", eventsHandler)
	http.HandleFunc("/stats", statsHandler)
	fmt.Println("Analytics service listening on port 8080")
	http.ListenAndServe(":8080", nil)
}

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { BACKEND_BASE_URL_WS } from "@/constants";

interface DetectionData {
    detected_person: boolean
    detected_gun: boolean
    detected_knife: boolean
    detected_multiple_persons: boolean
    text_message: string
}

const useDetectionWebSocket = (apiConnected: boolean, isNlpEnabled: boolean) => {
    const [socket, setSocket] = useState<Socket | null>(null)
    const [detections, setDetections] = useState({
        person: false,
        gun: false,
        knife: false,
        multiplePersons: false,
    })
    const [nlpMessage, setNlpMessage] = useState("")
    const [detectedObjects, setDetectedObjects] = useState<{ id: number; timestamp: string; type: string; message: string }[]>([])

    useEffect(() => {
        if (!apiConnected) {
            setDetections({
                person: false,
                gun: false,
                knife: false,
                multiplePersons: false,
            })
            setNlpMessage("")
            return
        }

        // Establish WebSocket connection
        const newSocket = io(BACKEND_BASE_URL_WS)

        newSocket.emit("get-person-ws", {nlp: isNlpEnabled})

        newSocket.on("person_detection_response", (data: DetectionData) => {
            setDetections({
                person: data.detected_person || false,
                gun: data.detected_gun || false,
                knife: data.detected_knife || false,
                multiplePersons: data.detected_multiple_persons || false,
            })

            if (isNlpEnabled && data.text_message) {
                setNlpMessage(data.text_message)
            } else {
                setNlpMessage("")
            }

            if (data.detected_person || data.detected_gun || data.detected_knife || data.detected_multiple_persons) {
                const newDetection = {
                    id: Date.now(),
                    timestamp: new Date().toLocaleTimeString(),
                    type: data.detected_gun
                        ? "Gun"
                        : data.detected_knife
                            ? "Knife"
                            : data.detected_multiple_persons
                                ? "Multiple Persons"
                                : data.detected_person
                                    ? "Person"
                                    : "Unknown",
                    message: data.text_message
                }
                setDetectedObjects((prev) => [newDetection, ...prev].slice(0, 5))
            }
        })

        newSocket.on("disconnect", () => {
            console.log("Disconnected from WebSocket")
        })

        setSocket(newSocket)

        return () => {
            newSocket.emit("toggle_updates", { enabled: false }) // Stop updates before disconnecting
            newSocket.disconnect()
        }
    }, [apiConnected, isNlpEnabled])

    return { detections, nlpMessage, detectedObjects }
}

export default useDetectionWebSocket
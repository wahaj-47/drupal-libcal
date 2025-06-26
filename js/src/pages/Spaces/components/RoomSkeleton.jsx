import React from "react"
import { motion } from "framer-motion";

const RoomSkeleton = () => {
    return (
        <div
            class="space-room">
            <motion.a
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <div class="room-header pointer">
                    <div class="room-image">
                        <div class="room-image-skeleton"></div>
                    </div>
                    <div class="room-label">
                        <h3>
                            <div class="room-name-skeleton"></div>
                        </h3>
                        <span class="room-zone">
                            <div class="room-zone-skeleton"></div>
                        </span>
                        <span className="available">
                        </span>
                    </div>
                </div>
            </motion.a>
            <div class="room-details">
                <p>
                    <div class="room-details-skeleton"></div>
                    <div class="room-details-skeleton"></div>
                    <div class="room-details-skeleton"></div>
                    <div class="room-details-skeleton"></div>
                </p>
            </div>
        </div>
    )
}

export default RoomSkeleton
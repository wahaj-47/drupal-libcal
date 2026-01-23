import React from "react"
import { motion } from "framer-motion";

const RoomSkeleton = () => {
    return (
        <div
            className="space-room">
            <motion.a
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <div className="room-header pointer">
                    <div className="room-image">
                        <div className="room-image-skeleton"></div>
                    </div>
                    <div className="room-label">
                        <h2 className="sr-only">Loading</h2>
                        <h3>
                            <span className="sr-only">Room name</span>
                            <div className="room-name-skeleton"></div>
                        </h3>
                        <span className="room-zone">
                            <span className="sr-only">Room zone</span>
                            <div className="room-zone-skeleton"></div>
                        </span>
                        <span className="available sr-only">
                            Room available
                        </span>
                    </div>
                </div>
            </motion.a>
            <div className="room-details">
                <p>
                    <span className="sr-only">Room details</span>
                    <div className="room-details-skeleton"></div>
                    <div className="room-details-skeleton"></div>
                    <div className="room-details-skeleton"></div>
                    <div className="room-details-skeleton"></div>
                </p>
            </div>
        </div>
    )
}

export default RoomSkeleton
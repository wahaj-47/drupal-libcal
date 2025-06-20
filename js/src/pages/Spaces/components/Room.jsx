import React from "react";
import { motion } from 'framer-motion'
import parse from "html-react-parser";

const origin = window.location.origin

const Room = ({ location, category, room }) => {
    const { description: lDescription } = location;
    const { description: cDescription } = category;
    const { id, name, groupName, groupId, lid, image, zoneName, availability = 'checking', availableIn, description } = room;

    return (
        <div
            class="space-room">
            <motion.a
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                href={`${origin}/spaces/booking/reserve?id=${id}&category=${groupName}&categoryId=${groupId}&locationId=${lid}`}>
                <div class="roomHeader pointer">
                    <div class="roomImage">
                        {image && <img src={image} className="preview-img"></img>}
                    </div>
                    <div class="roomLabel">
                        <h3>{name}</h3>
                        <span class="roomZone">{zoneName}</span>
                        {availability === 'checking' && <span>Checking availability...</span>}
                        {availability === "now" && <span className="available">Available Now</span>}
                        {availability === "soon" && <span>Available in {availableIn}</span>}
                        {availability === "unavailable" && <span>Unavailable</span>}
                    </div>
                </div>
            </motion.a>
            <div class="roomDetails">
                {description && parse(description)}
                {cDescription && parse(cDescription)}
                {lDescription && parse(lDescription)}
                {/* insert room directions here */}
            </div>
        </div>
    );
};

export default Room
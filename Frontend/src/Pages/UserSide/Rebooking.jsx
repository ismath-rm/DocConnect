import React, { useState, useEffect } from 'react';

// Function to fetch available slots from the server
const fetchAvailableSlots = async (cancelledTime) => {
    // Replace with your API endpoint and parameters
    const response = await fetch(`/api/slots?cancelledTime=${cancelledTime}`);
    const data = await response.json();
    return data;
};

const RebookingComponent = ({ cancelledTime }) => {
    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);

    useEffect(() => {
        // Fetch available slots when component mounts or cancelledTime changes
        const getSlots = async () => {
            const availableSlots = await fetchAvailableSlots(cancelledTime);
            setSlots(availableSlots);
        };

        getSlots();
    }, [cancelledTime]);

    const handleSlotSelection = (slot) => {
        setSelectedSlot(slot);
    };

    const handleRebook = async () => {
        if (selectedSlot) {
            // Replace with your API endpoint for rebooking
            await fetch('/api/rebook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slot: selectedSlot })
            });
            alert('Booking successful!');
            // Redirect or update state as needed
        }
    };

    const handleReject = () => {
        // Redirect to find a doctor or handle rejection
        window.location.href = '/find-doctor';
    };

    return (
        <div>
            <h2>Rebook Appointment</h2>
            {slots.length > 0 ? (
                <div>
                    <h3>Nearest Available Slots</h3>
                    <ul>
                        {slots.map(slot => (
                            <li key={slot.id}>
                                <button onClick={() => handleSlotSelection(slot)}>
                                    {slot.time}
                                </button>
                            </li>
                        ))}
                    </ul>
                    {selectedSlot && (
                        <div>
                            <p>Selected Slot: {selectedSlot.time}</p>
                            <button onClick={handleRebook}>Confirm Rebook</button>
                            <button onClick={handleReject}>Reject and Find Doctor</button>
                        </div>
                    )}
                </div>
            ) : (
                <p>No available slots found. Please try again later.</p>
            )}
        </div>
    );
};

export default RebookingComponent;

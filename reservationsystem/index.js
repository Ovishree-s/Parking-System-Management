import express from 'express';
import cors from 'cors';
import { initializeApp } from "firebase/app";


const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let reservations = [];
let nextId = 1;

// Get all reservations
app.get('/reservations', (req, res) => {
    res.json(reservations);
});

// Create a new reservation
app.post('/reserve', (req, res) => {
    const { user_name, date, time } = req.body;
    const newReservation = { id: nextId++, user_name, date, time };
    reservations.push(newReservation);
    res.send('Reservation successfully created!');
});

// Update a reservation
app.put('/update/:id', (req, res) => {
    const { id } = req.params;
    const { user_name, date, time } = req.body;
    const reservation = reservations.find(r => r.id == id);

    if (reservation) {
        reservation.user_name = user_name;
        reservation.date = date;
        reservation.time = time;
        res.send('Reservation updated successfully!');
    } else {
        res.status(404).send('Reservation not found!');
    }
});

// Delete a reservation
app.delete('/delete/:id', (req, res) => {
    const { id } = req.params;
    reservations = reservations.filter(r => r.id != id);
    res.send('Reservation deleted successfully!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

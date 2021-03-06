const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const HOST = '0.0.0.0';
const PORT = 3000;

const Event = require('./models/events');

dotenv.config();

const app = express();

const events = [];

app.use(bodyParser.json());

app.use('/graphql', graphqlHttp({
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
        events: () => {
            return Event.find();
        },
        createEvent: (args) => {
            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price,
                date: new Date(args.eventInput.date)
            });
            return event.save();
        }
    },
    graphiql: true
}));

app.get('/', (req, res, next) => {
    res.send('Up and running!');
});

mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });

app.listen(PORT, HOST, err => {
    if (err) { throw err; }
});
console.log(`Running on http://${HOST}:${PORT}`);

let express = require('express')
let app = express()
let ejsLayouts = require('express-ejs-layouts')
const mbxClient = require('@mapbox/mapbox-sdk')
const mbxGeocode = require('@mapbox/mapbox-sdk/services/geocoding');
const db = require('./models')

const mb = mbxClient({ accessToken: 'pk.eyJ1IjoiYmpnb2RkYXJkIiwiYSI6ImNrNGFpeXJsczA0ZjczbHBlOTBwbndqNGsifQ.L9Iak1L4F7fNOxRSyitiSQ'});
const geocode = mbxGeocode(mb)


app.use(ejsLayouts);
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(express.static("static"));

app.get('/', (req, res)=>{
  res.render('city-search')
})

app.get('/search', (req, res) => {
  geocode.forwardGeocode({
    query: `${req.query.city}, ${req.query.state}`,
    types: ['place'],
    countries: ['us']
  })
  .send()
  .then((result) => {
    let results = result.body.features.map(result => {
      return {
          city: result.place_name,
          state: result.place_name,
          lat: result.center[1],
          long: result.center[0]
      }
  })
  // res.render('cities/results', { query: req.query, results })
  // })
  console.log(results)

  res.render('search-results', { query: req.query, results })
  })
})

app.post('/add', (req, res) => {
  db.place.findOrCreate({
    where: {
        name: req.body.name
    },
    defaults: {
        lat: req.body.lat,
        long: req.body.long
    }
})
  .then(([city, created]) => {
    console.log(`${city.name} was ${created ? 'created' : 'found'}`)
    res.redirect('/favorites')
    })
  })


app.get('/favorites', (req, res) => {
  res.render('favorites')
})

//app.delete('/remove')


app.listen(process.env.PORT || 8000, console.log('🎧 Port 8000 🎧'))

// router.get('/search', (req, res) => {
//   res.render('cities/search')
// })

// router.get('/results', (req, res) => {
//   geocode.forwardGeocode({
//       query: `${req.query.city}, ${req.query.state}`,
//       types: ['place'],
//       countries: ['us']
//   })
//   .send()
//   .then((result) => {
//       let results = res.body.features.map(res => {
//           return {
//               name: result.place_name,
//               lat: result.center[1],
//               long: result.center[0]
//           }
//       })
//       res.render('cities/results', { query: req.query, results })
//   })
// })

// router.post('/add', (req, res) => {
//   db.place.findOrCreate({
//       where: {
//           name: req.body.name
//       },
//       defaults: {
//           lat: req.body.lat,
//           long: req.body.long
//       }
//   })
//   .then(([city, created]) => {
//       console.log(`${city.name} was ${created ? 'created' : 'found'}`)
//       res.redirect('/favorites')
//   })
// })

// router.get('favorites', (req, res) => {
//   db.place.findAll()
//   .then( (cities) => {
//       res.render('cities/favorites', { cities})
//   })
// })

// // geocoding
// //   .forwardGeocode({
// //     query: 'Seattle, WA'
// //   })
// //   .send()
// //   .then(res => {
// //     let match = res.body;
// //     console.log(match.features[0].center);
// //   });
// //   geocoding.reverseGeocode({
// //       query: [-122.3301, 47.6038]
// //   })
// //   .send()
// //   .then(res => {
// //       let match= res.body
// //       console.log(match)
// //   })

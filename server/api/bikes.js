var fs = require('fs-extra')
  , path = require('path')
  , _ = require('underscore')

module.exports.list = list
module.exports.create = create
module.exports.read = read
module.exports.update = update
module.exports.del = del
module.exports.total = total

var DATA_FILE = './resources/data.json'
if (process.env.NODE_ENV === 'test') 
  DATA_FILE = './test/resources/data.json'

var DATA = fs.readJsonSync(DATA_FILE) //happens at server startup

/**********************
 * Public Interface
 **********************/

function list (req, res) {
  var offset = ~~req.query.offset || 0
    , limit = ~~req.query.limit || 25

  res.json(DATA.slice(offset*limit, offset*limit + limit))
}

function create (req, res) {
  var newBike = req.body
  newBike.id = getLastId() + 1
  DATA.push(newBike)
  saveDB(function(err) {
    if (err) 
      res.json(formatRespData(0, err))
    else
      res.json(formatRespData({id: newBike.id}))
  })
}

function read (req, res) {
  var id = ~~req.params.id
  var bike = _(DATA).find(function(bike) { return bike.id === id })

  if (!bike)
    res.json(formatRespData(0, "Nie mogę odnaleźć roweru o id: " + id))
  else
    res.json(formatRespData(bike))
}

function update (req, res) {
  var id = ~~req.params.id
  var bike = _(DATA).find(function(bike) { return bike.id === id })

  var newBikeData = req.body
  bike = _(bike).extend(newBikeData)

  saveDB(function(err) {
    if (err) 
      res.json(formatRespData(0, err))
    else
      res.json(formatRespData({}))
  })
}

function del (req, res) {
  var id = ~~req.params.id
  var bike = _(DATA).find(function(bike) { return bike.id === id })

  var idx = DATA.indexOf(bike)
  if (idx < 0) return res.json(formatRespData(0, "Nie mogę odnaleźć roweru o id: " + id))

  DATA.splice(idx, 1)

  saveDB(function(err) {
    if (err) 
      res.json(formatRespData(0, err))
    else
      res.json(formatRespData({}))
  })
}

function total (req, res) {
  total = DATA.length ? DATA.length : 0
  res.json({total: total})
}



/*******************
 * Private Methods
 *******************/

function getLastId () {
  return DATA.length;
}

function formatRespData (code, content) {
  if (typeof code === 'object') {
    content = code,
    code = 1 //0 failure, 1 = success
  }

  return {
    code: code,
    content: content
  }
}

function saveDB (callback) {
  fs.writeJson(DATA_FILE, DATA, callback)
}


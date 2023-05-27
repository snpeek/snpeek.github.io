const fs = require('fs')
const chai = require('chai')
const expect = chai.expect

// eslint-disable-next-line no-undef
describe('JSON structure test', function () {
  // eslint-disable-next-line no-undef
  it('should have the expected keys and nested objects', function (done) {
    fs.readFile('./public/mps/mps-data.json', 'utf8', function (err, data) {
      if (err) {
        return done(err)
      }

      let json
      try {
        json = JSON.parse(data)
      } catch (err) {
        return done(err)
      }

      const expectedNestedKeys = ['phenotype', 'broken_geno', 'gene']

      Object.keys(json).forEach(function (key) {
        // Check the keys of each nested object
        const nestedObj = json[key]
        Object.keys(nestedObj).forEach(function (nestedKey) {
          expect(expectedNestedKeys).to.include(nestedKey)
        })
      })

      done()
    })
  })
})

import { expect } from 'chai'
import hope from '../src'

describe('github-hope package', function () {

  it('should exist', function () {
    expect(hope).to.exist
  })

  it('should have a evaluate method', function () {
    expect(hope.evaluate).to.exist
  })

})

import streamsql from '../index'
import StreamSQL from '../StreamSQL'

describe('StreamSQL package entry', () => {
  it('exports an instantiated streamsql instance', () => {
    expect(streamsql).toBeInstanceOf(StreamSQL)
  })
})
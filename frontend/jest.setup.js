// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
  })
);

window.HTMLElement.prototype.scrollIntoView = jest.fn() 
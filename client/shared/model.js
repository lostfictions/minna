// @ts-check

const { types } = require("mobx-state-tree");

const { method } = require("./method");

module.exports.model = types
  .model({
    x: 0,
    y: 0
  })
  .actions(self => ({
    addOne: method(() => {
      self.x += 1;
    })
  }));

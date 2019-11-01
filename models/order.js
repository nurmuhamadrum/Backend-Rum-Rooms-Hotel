"use strict";
module.exports = (sequelize, DataTypes) => {
  const order = sequelize.define(
    "order",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      customer_id: DataTypes.INTEGER,
      room_id: DataTypes.INTEGER,
      is_done: DataTypes.BOOLEAN,
      is_booked: DataTypes.BOOLEAN,
      order_end_time: DataTypes.DATE,
      duration: DataTypes.INTEGER
    },
    {}
  );
  order.associate = function(models) {
    order.belongsTo(models.customer, {
      foreignKey: "customer_id",
      sourceKey: "id"
    });
    order.belongsTo(models.rooms, {
      foreignKey: "room_id",
      sourceKey: "id"
    });
  };
  return order;
};

const models = require("../models");
const Rooms = models.rooms;
const User = models.user;
const Customer = models.customer;
const Order = models.order;

exports.getRooms = (req, res) => {
  Rooms.findAll({}).then(data => {
    res.send(data);
  });
};

exports.postRooms = (req, res) => {
  const newData = {
    name: req.body.name
  };
  Rooms.create(newData).then(data => {
    if (data) {
      Rooms.findAll({}).then(item => {
        res.send(item);
      });
    } else {
      res.status(400).json({ message: "No room was added" });
    }
  });
};

exports.putRooms = (req, res) => {
  const { room_id } = req.params;
  const { name } = req.body;

  Rooms.update(
    {
      name
    },
    {
      where: { id: room_id }
    }
  ).then(data => {
    if (data) {
      Rooms.findAll({
        attributes: { exclude: ["createdAt", "updatedAt"] }
      }).then(item => {
        res.send(item);
      });
    } else {
      res.status(400).json({ message: "No room was edited" });
    }
  });
};

exports.getCustomers = (req, res) => {
  Customer.findAll({}).then(data => {
    res.send(data);
  });
};

exports.postCustomers = (req, res) => {
  const newData = {
    name: req.body.name,
    identity_number: req.body.identity_number,
    phone_number: req.body.phone_number,
    image: req.body.image
  };
  Customer.create(newData).then(data => {
    if (data) {
      Customer.findAll({}).then(item => {
        res.send(item);
      });
    } else {
      res.status(400).json({ message: "No Customer was added" });
    }
  });
};

exports.putCustomers = (req, res) => {
  const { customer_id } = req.params;
  const { name, identity_number, phone_number, image } = req.body;

  Customer.update(
    {
      name,
      identity_number,
      phone_number,
      image
    },
    {
      where: { id: customer_id }
    }
  ).then(data => {
    if (data) {
      Customer.findAll({
        attributes: { exclude: ["createdAt", "updatedAt"] }
      }).then(item => {
        res.send(item);
      });
    } else {
      res.status(400).json({ message: "No customer was edited" });
    }
  });
};

exports.getCheckinRoom = (req, res) => {
  Rooms.findAll({
    include: [
      {
        model: Customer,
        as: "customers",
        attributes: { exclude: ["createdAt", "updatedAt"] },
        through: {
          model: Order,
          where: { is_done: false },
          attributes: { exclude: ["createdAt", "updatedAt"] }
        }
      }
    ],
    attributes: { exclude: ["createdAt", "updatedAt"] }
  }).then(data => {
    res.send(getCheckin(data));
  });
};

const getCheckin = data => {
  const newData = data.map(item => {
    const customer = item.customers.map(entry => {
      const newCustomer = {
        id: entry.id,
        name: entry.name,
        identity_number: entry.identity_number,
        phone_number: entry.phone_number,
        image: entry.image
      };
      return newCustomer;
    });
    const order = item.customers.map(entry => {
      const { id, is_booked, is_done, duration, order_end_time } = entry.order;
      const newOrder = {
        id,
        is_booked,
        is_done,
        duration,
        order_end_time
      };
      return newOrder;
    });
    const newItem = {
      id: item.id,
      name: item.name,
      customer: customer[0],
      order: order[0]
    };
    return newItem;
  });
  return newData;
};

exports.postCheckin = (req, res) => {
  const { room_id, customer_id, duration } = req.body;

  Order.findOne({
    where: { room_id, is_booked: true, is_done: false }
  }).then(item => {
    if (item) {
      res.status(400).json({ message: "Room already booked" });
    } else {
      const time = new Date();
      time.setMinutes(time.getMinutes() + duration);
      Order.create({
        room_id,
        customer_id,
        duration,
        order_end_time: time,
        is_done: false,
        is_booked: true
      }).then(data => {
        if (data) {
          Rooms.findAll({
            include: [
              {
                model: Customer,
                as: "customers",
                attributes: { exclude: ["createdAt", "updateAt"] },
                through: {
                  model: Order,
                  where: { is_done: false },
                  attributes: { exclude: ["createdAt", "updateAt"] }
                }
              }
            ],
            attributes: { exclude: ["createdAt", "updateAt"] }
          }).then(data => {
            res.send(getCheckin(data));
          });
        } else {
          res.status(400).json({ message: "No checkin was added" });
        }
      });
    }
  });
};

const getCheckout = data => {
  const newData = data.map(item => {
    const customer = item.customers.map(entry => {
      const newCustomer = {
        id: entry.id,
        name: entry.name,
        identity_number: entry.identity_number,
        phone_number: entry.phone_number,
        image: entry.image
      };
      return newCustomer;
    });
    const order = item.customers.map(entry => {
      const { id, is_booked, is_done, duration, order_end_time } = entry.order;
      const newOrder = {
        id,
        is_booked,
        is_done,
        duration,
        order_end_time
      };
      return newOrder;
    });
    const newItem = {
      id: item.id,
      name: item.name,
      customer: customer[0],
      order: order[0]
    };
    return newItem;
  });
  return newData;
};

exports.putOrders = (req, res) => {
  const { order_id } = req.params;

  Order.update(
    {
      is_booked: false,
      is_done: true
    },
    {
      where: { id: order_id, is_booked: true, is_done: false }
    }
  ).then(data => {
    if (data) {
      Rooms.findAll({
        include: [
          {
            model: Customer,
            as: "customers",
            attributes: { exclude: ["createdAt", "updatedAt"] },
            through: {
              model: Order,
              where: { is_done: false },
              attributes: { exclude: ["createdAt", "updatedAt"] }
            }
          }
        ],
        attributes: { exclude: ["createdAt", "updatedAt"] }
      }).then(data => {
        res.send(getCheckout(data));
      });
    } else {
      res.status(400).json({ message: "Checkout Fail" });
    }
  });
};

exports.getProfile = (req, res) => {
  const { user_id } = req.params;

  User.findOne({
    where: { id: user_id },
    attributes: { exclude: ["createdAt", "updatedAt"] }
  }).then(data => {
    res.send(data);
  });
};

exports.putProfile = (req, res) => {
  const { user_id } = req.params;
  const avatarURI = process.env.BASE_URL + req.file.path;

  User.update(
    { avatarURI },
    {
      where: { id: user_id }
    }
  ).then(() => {
    User.findOne({
      where: { id: user_id },
      attributes: { exclude: ["createdAt", "updatedAt"] }
    }).then(data => {
      res.send(data);
    });
  });
};

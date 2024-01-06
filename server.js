var express = require("express");
var app = express();
app.use(express.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, , authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET,POST,DELETE,PUT,OPTIONS");
  next();
});

var port = process.env.PORT || 2410;
app.listen(port, () => console.log("Listening on port:", port));

let { mobiles } = require("./data/mobilesData.js");
let { reviews } = require("./data/review.js");
let { pincodes } = require("./data/pincodes.js");
let { users } = require("./data/users.js");

function paginateArray(inputArray, pageNumber, itemsPerPage = 7) {
  const startIndex = (pageNumber - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageValues = inputArray.slice(startIndex, endIndex);
  return pageValues;
}

function checkRAM(ram, ramsArr) {
  if (ramsArr.indexOf(">=6") >= 0) {
    if (ram >= 6) {
      return true;
    }
  }
  if (ramsArr.indexOf("<=4") >= 0) {
    if (ram <= 4) {
      return true;
    }
  }
  if (ramsArr.indexOf("<=3") >= 0) {
    if (ram <= 3) {
      return true;
    }
  }
  if (ramsArr.indexOf("<=2") >= 0) {
    if (ram <= 2) {
      return true;
    }
  }
  return false;
}
function checkRating(val, Arr) {
  if (Arr.indexOf(">4") >= 0) {
    if (val > 4) {
      return true;
    }
  }
  if (Arr.indexOf(">3") >= 0) {
    if (val > 3) {
      return true;
    }
  }
  if (Arr.indexOf(">2") >= 0) {
    if (val > 2) {
      return true;
    }
  }
  if (Arr.indexOf(">1") >= 0) {
    if (val > 1) {
      return true;
    }
  }
  return false;
}
function checkPrice(val, Arr) {
  if (Arr.indexOf("0-5000") >= 0) {
    if (val > 0 && val < 5000) {
      return true;
    }
  }
  if (Arr.indexOf("5000-10000") >= 0) {
    if (val > 5000 && val < 10000) {
      return true;
    }
  }
  if (Arr.indexOf("10000-20000") >= 0) {
    if (val > 10000 && val < 20000) {
      return true;
    }
  }
  if (Arr.indexOf("20000") >= 0) {
    if (val > 20000) {
      return true;
    }
  }
  return false;
}
function getRandomItems(originalArray, numberOfItems) {
  const shuffledArray = [...originalArray];
  let currentIndex = shuffledArray.length;

  while (currentIndex !== 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [shuffledArray[currentIndex], shuffledArray[randomIndex]] = [
      shuffledArray[randomIndex],
      shuffledArray[currentIndex],
    ];
  }

  return shuffledArray.slice(0, numberOfItems);
}
function findMaxId(ids) {
  let maxId = null;

  for (let i = 0; i < ids.length; i++) {
    const currentId = ids[i];
    const numericPart = parseInt(currentId.substring(1));

    if (isNaN(numericPart)) {
      // Skip invalid numeric parts
      continue;
    }

    if (maxId === null || numericPart > parseInt(maxId.substring(1))) {
      maxId = currentId;
    }
  }

  if (maxId !== null) {
    const nextNumericPart = parseInt(maxId.substring(1)) + 1;
    return "M" + nextNumericPart;
  }

  return "M1";
}

app.get("/products/:category/:brand?", function (req, res) {
  const { category, brand } = req.params;
  const { page, q, sort, price, ram, rating, assured } = req.query;

  if (category != "Mobiles") {
    let arr = [];
    res.send(arr);
  } else {
    let arr = [...mobiles];
    if (brand) {
      arr = arr.filter((a) => a.brand === brand);
    }
    if (assured) {
      arr = arr.filter((a) => a.assured === true);
    }
    if (ram) {
      let ram1 = ram.split(",");
      arr = arr.filter((a) => checkRAM(a.ram, ram1));
    }
    if (rating) {
      let rating1 = rating.split(",");
      arr = arr.filter((a) => checkRating(a.rating, rating1));
    }
    if (price) {
      let price1 = price.split(",");
      arr = arr.filter((a) => checkPrice(a.price, price1));
    }
    if (sort) {
      arr = sort
        ? sort === "asc"
          ? arr.sort((a, b) => a.price - b.price)
          : sort === "dsc"
          ? arr.sort((a, b) => b.price - a.price)
          : sort === "popularity"
          ? arr.sort((a, b) => a.popularity - b.popularity)
          : arr
        : arr;
    }
    if (q) {
      arr = arr.filter((a) => a.name.includes(q));
    }
    let arr1 = page ? paginateArray(arr, page) : paginateArray(arr, 1);
    let json = { products: arr1, totalPage: arr.length };
    res.send(json);
  }
});

app.get("/deals", function (req, res) {
  let arr = [...mobiles];
  let arr1 = getRandomItems(arr, 14);
  res.send(arr1);
});

app.get("/product/:id", function (req, res) {
  let id = req.params.id;
  let mobile = mobiles.find((a) => a.id === id);
  res.send(mobile);
});
app.get("/pincode/:pincode/:id", function (req, res) {
  let id = req.params.id;
  let pincode = req.params.pincode;

  let index = pincodes.findIndex((a) => a.pincode == pincode);
  let arr = index >= 0 ? pincodes[index].mobileList : [];
  let arrIndex = arr.findIndex((a) => a.id === id);
  let pincodeDetail =
    arrIndex >= 0 ? arr[arrIndex].display : "Delivery in 4-5 days ";
  res.send(pincodeDetail);
});
app.get("/reviews/:id", function (req, res) {
  let id = req.params.id;
  let review = reviews.find((a) => a.mobileId === id);
  let { ratings = [] } = review;
  res.send(ratings);
});

app.post("/login", function (req, res) {
  let body = req.body;
  let { email = "", password = "" } = body;
  let index = users.findIndex(
    (a) => a.email === email && a.password === password
  );
  index >= 0
    ? res.send(users[index])
    : res.status(401).send("Invalid Email or Password");
});

app.post("/checkout", function (req, res) {
  let body = req.body;
  let { email = "", password = "", order = [] } = body;
  let index = users.findIndex(
    (a) => a.email === email && a.password === password
  );
  users[index].orders.unshift(order);
  res.send(users[index]);
});
app.post("/orders", function (req, res) {
  let body = req.body;
  let { email = "", password = "" } = body;
  let index = users.findIndex(
    (a) => a.email === email && a.password === password
  );
  let orders = users[index].orders;
  res.send(orders);
});
app.put("/updateUser", function (req, res) {
  let body = req.body;
  let { email = "", password = "" } = body;
  let index = users.findIndex(
    (a) => a.email === email && a.password === password
  );
  users[index] = body;
  res.send(body);
});

app.get("/AllProducts", function (req, res) {
  res.send(mobiles);
});

app.get("/AllProducts/:id", function (req, res) {
  let id = req.params.id;
  let index = mobiles.findIndex((a) => a.id == id);
  res.send(mobiles[index]);
});

app.post("/AllProducts", function (req, res) {
  let body = req.body;
  let ids = mobiles.reduce((a, c) => [...a, c.id], []);
  const nextId = findMaxId(ids);
  body = { ...body, id: nextId };
  mobiles.unshift(body);
  res.send(body);
});
app.put("/AllProducts/:id", function (req, res) {
  let id = req.params.id;
  let body = req.body;
  let index = mobiles.findIndex((a) => a.id === id);
  mobiles[index] = body;
  res.send(mobiles[index]);
});
app.delete("/AllProducts/:id", function (req, res) {
  let id = req.params.id;
  let index = mobiles.findIndex((a) => a.id === id);
  mobiles.splice(index, 1);
  res.send("Deleted");
});

const API = require("./utils/api.js");
const Util = require("./utils/util.js");
const fs = require("fs");
const jpeg = require("./utils/jpeg.js");
var fileBuffer = fs.readFileSync("static/img/63a5110bf12b0acef2f68e0e1a023502.jpg");
/*
console.log(fileBuffer);
console.log(fileBuffer.length);*/

const insertItem = ({ id, image, author }) => {
  return `mutation InsertItem {
    __typename
    insert_items(objects: {id: ${id}, author: "${author}", image: "${fileBuffer.toString("base64")}"}) {
      affected_rows
      returning {
        author
        id
        image
      }
    }
  }`;
};
const queryItems = () => {
  return `query ListItems {
 items {
   id
  image
  author
 }
}`;
};

const api = API();
let res;
res = api.insert("items", { id: 46, image: "x.jpg", author: "mister x" });
res.then(res => {
  const items = res.data && res.data.insert_items ? res.data.insert_items.returning : [];
  for(let item of items) {
    console.log("Inserted item: ", item);
  }

  //console.log("res: ", res.data);
});

function addPhoto(path) {
  var buf = fs.readFileSync(path);

  if(jpeg.isJpeg(buf)) {
    const arr = Uint8Array.from(buf);
    var props = jpeg.jpegProps(arr);

    return api.insert("photos", { data: buf.toString("base64"), filesize: buf.length, width: props.width, height: props.height });
  }
}
let prom = Promise.all(
  [
    "static/img/04b79de115044501f1358f829130438d.jpg",
    "static/img/0c71247f63ff20833347da1484d3caa4.jpg",
    "static/img/2a5c935eaf38ee7da68a6208730d6388.jpg",
    "static/img/4112bc4fca9ef56f8982de334e9a3afc.jpg",
    "static/img/63a5110bf12b0acef2f68e0e1a023502.jpg",
    "static/img/69353138_350963942449628_6079377653159165952_n.jpg",
    "static/img/69536222_653691828474365_6429980850053447680_n.jpg",
    "static/img/69688821_689014168592533_7393339862767632384_n.jpg",
    "static/img/69738320_488180518412115_8495700638703812608_n.jpg",
    "static/img/70285928_389116288450926_7739364985301630976_n.jpg",
    "static/img/75264909_541441350014341_6284290667405377536_n.jpg",
    "static/img/76619287_430389744517453_4826291339341594624_n.jpg",
    "static/img/76771501_2539648529692993_599570957710917632_n.jpg",
    "static/img/86463ed8ed391bf6b0a2907df74adb37.jpg",
    "static/img/8cb3c5366cc81b5fe3e061a65fbf4045.jpg",
    "static/img/cdb466a69cc7944809b20e7f34840486.jpg",
    "static/img/d415b80a6007124c4e3948b21a7f0ed1.jpg",
    "static/img/e192e59519fd905d40532f748e65fbf2.jpg",
    "static/img/e758ee9aafbc843a1189ff546c56e5b5.jpg",
    "static/img/fdcce856cf66f33789dc3934418113a2.jpg"
  ].map(path => addPhoto(path))
);
prom.then(res => console.log("res: ", res));

const convertImage = item => {
  var ret = null;
  var buf = Buffer.from(item.image, "base64");
  if(/\.jpe?g$/.test(item.image)) {
    try {
      buf = fs.readFileSync(item.image);
    } catch(err) {
      return item.image;
    }
  }
  if(jpeg.isJpeg(buf)) {
    const arr = Uint8Array.from(buf);
    return jpeg.jpegProps(arr);
  }
  return null;
};

res = api.list("items", "author,image");
res.then(res => {
  const items = res.map(item => ({
    ...item,
    image: convertImage(item)
  }));
  /*  console.log("res: ", items);
   */
  for(let item of items) {
    console.log("Item: ", item);
  }
  // items.forEach(console.log);
});

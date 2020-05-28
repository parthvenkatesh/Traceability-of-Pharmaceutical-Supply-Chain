import {
  productListManager,
  addItemToList,
  format_date,
  init_web3,
  productPartListManager,
  getMultipleActivePart,
  getActivePart,
  clearproductDetails,
  getOwnerHistoryFromEvents,
  getOwnedItemsFromEvent
} from "./utils.js";

window.onload = async function() {
  var x = await init_web3();

  // document
  //   .getElementById("register-part")
  //   .addEventListener("click", function() {
  //     console.log("Register Received Part");

  //     var addr = document.getElementById("part-addr").value;

  //     if (addr != "") {
  //       addItemToList(addr, "product-part-list", productPartListManager);
  //     }
  //   });

  //Get all the parts that belonged to this factory and then check the ones that still do

  var id = window.accounts[1];
  document.getElementById("product-factory-address").innerHTML = id;
  var parts = await getOwnedItemsFromEvent(
    window.accounts[0],
    "TransferPartOwnership"
  );
  console.log(parts);
  for (var i = 0; i < parts.length; i++) {
    var owners = await getOwnerHistoryFromEvents(
      "TransferPartOwnership",
      parts[i]
	);
	
    if (owners[owners.length - 1] == window.accounts[1]) {
      addItemToList(parts[i], "product-part-list", productPartListManager);
    }
  }

  document.getElementById("build-product").addEventListener("click", function() {
    console.log("Build product");

    //First, get the serial number
    var serial = document.getElementById("create-product-serial-number").value;
    if (serial != "") {
      //Then the parts that will be present on the product
      var part_list = getMultipleActivePart();
      var part_array = [];
      for (var i = 0; i < part_list.length; i++) {
        part_array.push(part_list[i].textContent);
      }

      // //Fill part array with dummy elements for the unprovided parts
      // while(part_array.length < 6){
      //     part_array.push("0x0")
      // }
      var creation_date = format_date();

      console.log("Create product with params");
      console.log(serial);
      console.log(part_array);
      console.log(creation_date);
      //Finally, build the product
      window.pm.methods
        .buildProduct(serial, "product", creation_date, part_array)
        .send({ from: window.accounts[1], gas: 2000000 }, function(
          error,
          result
        ) {
          if (error) {
            console.log(error);
          } else {
            console.log("product created");
            //Add hash to product owned list
            var product_sha = web3.utils.soliditySha3(
              window.accounts[1],
              web3.utils.fromAscii(serial),
              web3.utils.fromAscii("product"),
              web3.utils.fromAscii(creation_date)
            );
            addItemToList(product_sha, "product-list", productListManager);

            //Remove parts from available list
            for (var i = 0; i < part_list.length; i++) {
              part_list[i].removeEventListener("click", productPartListManager);
              part_list[i].parentElement.removeChild(part_list[i]);
            }
          }
        });
    }
  });

  document
    .getElementById("product-change-ownership-btn")
    .addEventListener("click", function() {
      console.log("Change Ownership");
      //Get product hash from active item on owned list

      var hash_element = getActivePart("product-list");
      if (hash_element != undefined) {
        var to_address = document.getElementById("product-change-ownership-input")
          .value;
        if (to_address != "") {
          window.co.methods
            .changeOwnership(1, hash_element.textContent, to_address)
            .send({ from: window.accounts[1], gas: 100000 }, function(
              error,
              result
            ) {
              if (error) {
                console.log(error);
              } else {
                console.log("Changed ownership");
                //Logic to remove item from owned list
                hash_element.parentElement.removeChild(hash_element);
                clearproductDetails();
              }
            });
        }
      }
    });
};

//0xaa39f40ab0633ae9a1bbf643addfa3063a89666755ce1395a0742c4baf77e86e
//0x3fa38b7252038199b6c7ebb5b98bad3e97078790994d4ead584251015373eeac
//0x6adc265a4f62967693e499536e46c923506d5e55acf3f5502a15021c06c56a31
//0xaf11934fcff38d5bda623b4d16d18049e6200e19cf9a0da94368e98bc5794c1a
//0xca42aef82d8e832fa9532872772e3dbdf472e4f29790647654bb4df17cf55f7e
//0x73013ace31bfcdbf3810945b74ceb9e1516e09dabd157eb6b5ccdf8f78a5ac99

const championsData = require("./champion.json").data;
const itemsData = require("./items.json").data;
const fs = require("fs");
const run = async () => {
   //api champions http://ddragon.leagueoflegends.com/cdn/13.11.1/data/en_US/champion.json
   //api item champion http://ddragon.leagueoflegends.com/cdn/13.11.1/img/champion/Aatrox.png
   await fs.promises.writeFile(
      "convert-champion.json",
      JSON.stringify(
         Object.entries(championsData).map(
            ([
               championName,
               {
                  image: { full },
                  key,
               },
            ]) => {
               return {
                  championName,
                  image: `http://ddragon.leagueoflegends.com/cdn/13.11.1/img/champion/${full}`,
                  id: key,
               };
            }
         )
      )
   );
   //api items http://ddragon.leagueoflegends.com/cdn/13.11.1/data/en_US/item.json
   //api item image http://ddragon.leagueoflegends.com/cdn/13.11.1/img/item/1001.png
   await fs.promises.writeFile(
      "convert-items.json",
      JSON.stringify(
         Object.entries(itemsData)
            .filter(
               ([_, { maps, into, from, depth }]) =>
                  (depth > 2 && maps["12"] && !into?.length && from?.length) ||
                  (maps["12"] &&
                     !into?.length &&
                     from?.length &&
                     from.includes("1001"))
            )
            .map(([imageCode, { description, name, from }]) => {
               const isBoots = (from && from.includes("1001")) || false;
               const isLegendary =
                  description.includes(
                     "<rarityLegendary>Legendary</rarityLegendary>"
                  ) || false;
               return {
                  itemName: name,
                  image: `https://ddragon.leagueoflegends.com/cdn/13.11.1/img/item/${imageCode}.png`,
                  isBoots,
                  isLegendary,
                  id: imageCode,
               };
            })
            .sort((a, b) => b.isLegendary - a.isLegendary)
            .sort((a, b) => {
               if (a.isLegendary) return 1;
               return b.isBoots - a.isBoots;
            })
      )
   );
   console.log("Ok");
};
run();

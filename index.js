const championsData = require("./champion.json").data;
const itemsData = require("./items.json").data;
const groupItem = require("./group-item.json");
const damageTags = require("./damage-tag.json");
const fs = require("fs");
const findGroupItem = (itemName) => {
   const groupsName = [];
   for (const [groupName, items] of Object.entries(groupItem)) {
      if (items.includes(itemName)) groupsName.push(groupName);
   }
   if (groupsName.length) return groupsName;
   return null;
};
const checkTankItem = (itemTag) => {
   const groupsName = [];
   for (const tag of itemTag) {
      for (const damageTag of damageTags) {
         if (tag === damageTag) return false;
      }
   }
   return true;
};
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
                  stats: { attackrange },
                  key,
               },
            ]) => {
               return {
                  championName,
                  image: `http://ddragon.leagueoflegends.com/cdn/13.11.1/img/champion/${full}`,
                  id: key,
                  isMelee: attackrange <= 200,
                  isRange: attackrange > 200,
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
            .map(([imageCode, { description, name, from, tags }]) => {
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
                  groupName: findGroupItem(name),
                  isNoDamage: checkTankItem(tags),
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

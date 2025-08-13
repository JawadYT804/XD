const herokuKeys = [
  "HRKU-AAuwoUxCk-uxAbO4n-XbEeshD_NVdtSDObqU1SVqbtoA_____wK2CHAxpWnu",
  "HRKU-AAuwoUxCk-uxAbO4n-XbEeshD_NVdtSDObqU1SVqbtoA_____wK2CHAxpWnu",
  "HRKU-AAuwoUxCk-uxAbO4n-XbEeshD_NVdtSDObqU1SVqbtoA_____wK2CHAxpWnu"
];

function getRandomHerokuKey() {
  return herokuKeys[Math.floor(Math.random() * herokuKeys.length)];
}

module.exports = { getRandomHerokuKey };

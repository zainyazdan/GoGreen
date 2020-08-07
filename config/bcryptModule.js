const bcrypt = require('bcrypt');




const BCRYPT_SALT_ROUNDS = 12;

// module.exports.BCRYPT_SALT_ROUNDS = BCRYPT_SALT_ROUNDS;




async function ComputeSaltHash(_str)
{
    return await bcrypt.hash(_str, BCRYPT_SALT_ROUNDS);
}
module.exports.ComputeSaltHash = ComputeSaltHash;




async function CompareHash(_str1, _str2)
{
    return bcrypt.compareSync(_str1, _str2);
}

module.exports.CompareHash = CompareHash;




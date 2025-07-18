const ldap = require('ldapjs');

async function ldapAuthenticate(username, password) {
    return new Promise((resolve) => {
        const client = ldap.createClient({
            url: 'ldap://10.2.19.99:389',
        });

        const fullUsername = username; 
        client.bind(fullUsername, password, (err) => {
            client.unbind(); // Dọn dẹp

            if (err) {
                console.error(`LDAP login failed for ${fullUsername}:`, err.message);
                return resolve(false);
            }

            return resolve(true);
        });
    });
}

module.exports = { ldapAuthenticate };

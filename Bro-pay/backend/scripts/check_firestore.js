const adminImport = require('firebase-admin');
const admin = (adminImport && adminImport.default) ? adminImport.default : adminImport;
const serviceAccount = require('../service-account.json');

const certFn = (admin.credential && admin.credential.cert) ? admin.credential.cert : admin.cert;
if (!certFn) {
  console.error('No cert function found on firebase-admin; aborting');
  process.exit(1);
}
admin.initializeApp({ credential: certFn(serviceAccount) });
const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore();

async function check() {
  const collections = ['users','wallets','transactions','notifications','activities','budgets','goals','splitBills','moneyRequests','analytics','settings'];
  for (const col of collections) {
    try {
      const snap = await db.collection(col).limit(100).get();
      console.log(col, '=>', snap.size);
    } catch (err) {
      console.error('Error reading', col, err.message || err);
    }
  }
  process.exit(0);
}

check();

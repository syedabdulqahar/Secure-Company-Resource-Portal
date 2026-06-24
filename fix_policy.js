const db = require('./backend/src/db');

async function fixPolicy() {
  try {
    // Fix the wrong DENY policy: location != Remote should be location = Remote
    const result = await db.query(
      `UPDATE policies 
       SET operator = '='
       WHERE attribute = 'location' 
         AND operator = '!=' 
         AND value = 'Remote' 
         AND action = 'DENY'
       RETURNING *`
    );
    if (result.rows.length > 0) {
      console.log('✅ Policy fixed:', result.rows[0]);
    } else {
      console.log('ℹ️  Policy already correct or not found');
    }

    // Verify all policies now
    const all = await db.query('SELECT * FROM policies ORDER BY policy_id');
    console.log('\n📋 All policies now:');
    all.rows.forEach(p => {
      console.log(`  [${p.action}] ${p.attribute} ${p.operator} ${p.value}`);
    });

    process.exit(0);
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
}

fixPolicy();

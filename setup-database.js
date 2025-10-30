const fs = require('fs');
const { Client } = require('pg');

// Database connection configuration
const client = new Client({
  host: '127.0.0.1',
  port: 54322,
  user: 'postgres',
  password: 'postgres',
  database: 'postgres'
});

/**
 * Parse PostgreSQL SQL content and split into individual statements
 * Handles dollar-quoted strings and function definitions properly
 */
function parsePostgreSQLStatements(sqlContent) {
  const statements = [];
  let currentStatement = '';
  let inDollarQuote = false;
  let dollarQuoteTag = '';
  let inSingleLineComment = false;
  let inMultiLineComment = false;
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < sqlContent.length; i++) {
    const char = sqlContent[i];
    const nextChar = sqlContent[i + 1] || '';
    const prevChar = sqlContent[i - 1] || '';

    // Handle comments
    if (!inString && !inDollarQuote) {
      if (char === '-' && nextChar === '-') {
        inSingleLineComment = true;
        currentStatement += char;
        continue;
      }
      if (inSingleLineComment) {
        currentStatement += char;
        if (char === '\n') {
          inSingleLineComment = false;
        }
        continue;
      }
      if (char === '/' && nextChar === '*') {
        inMultiLineComment = true;
        currentStatement += char;
        continue;
      }
      if (inMultiLineComment) {
        currentStatement += char;
        if (char === '/' && prevChar === '*') {
          inMultiLineComment = false;
        }
        continue;
      }
    }

    // Handle string literals
    if (!inDollarQuote && !inSingleLineComment && !inMultiLineComment) {
      if ((char === '"' || char === "'") && prevChar !== '\\') {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
          stringChar = '';
        }
      }
    }

    // Handle dollar quotes
    if (!inString && !inSingleLineComment && !inMultiLineComment) {
      if (char === '$' && !inDollarQuote) {
        // Look for dollar quote start
        let tag = '$';
        let j = i + 1;
        while (j < sqlContent.length && sqlContent[j] !== '$') {
          tag += sqlContent[j];
          j++;
        }
        if (j < sqlContent.length && sqlContent[j] === '$') {
          tag += '$';
          inDollarQuote = true;
          dollarQuoteTag = tag;
          currentStatement += tag;
          i = j; // Skip the tag
          continue;
        }
      } else if (char === '$' && inDollarQuote) {
        // Check if this is the end of the dollar quote
        let potentialEnd = '$';
        let j = i + 1;
        let k = 1;
        while (j < sqlContent.length && k < dollarQuoteTag.length - 1) {
          potentialEnd += sqlContent[j];
          j++;
          k++;
        }
        if (potentialEnd === dollarQuoteTag) {
          inDollarQuote = false;
          dollarQuoteTag = '';
          currentStatement += potentialEnd;
          i = j - 1; // Skip the tag
          continue;
        }
      }
    }

    currentStatement += char;

    // Check for statement end (semicolon) but only if not inside quotes or comments
    if (char === ';' && !inDollarQuote && !inString && !inSingleLineComment && !inMultiLineComment) {
      const trimmed = currentStatement.trim();
      if (trimmed && !trimmed.startsWith('--')) {
        statements.push(trimmed);
      }
      currentStatement = '';
    }
  }

  // Add any remaining statement
  const trimmed = currentStatement.trim();
  if (trimmed && !trimmed.startsWith('--')) {
    statements.push(trimmed);
  }

  return statements;
}

async function setupDatabase() {
  try {
    console.log('🔄 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');

    // Read the SQL file
    console.log('📖 Reading SQL file...');
    const sqlContent = fs.readFileSync('./src/database-setup-final.sql', 'utf8');

    // Parse SQL into individual statements (handles dollar quotes properly)
    const statements = parsePostgreSQLStatements(sqlContent);

    console.log(`📝 Found ${statements.length} SQL statements to execute...`);

    // Execute each statement
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`🔄 Executing statement ${i + 1}/${statements.length}...`);
          await client.query(statement);
          successCount++;
        } catch (error) {
          // Check if it's just a "already exists" error
          const isAlreadyExists = error.message?.includes('already exists') ||
                                 error.message?.includes('duplicate key') ||
                                 error.code === '23505' || // unique violation
                                 error.code === '42710'; // object already exists

          if (isAlreadyExists) {
            console.log(`ℹ️ Statement ${i + 1} already exists (skipping): ${error.message.split('\n')[0]}`);
          } else {
            console.warn(`⚠️ Error executing statement ${i + 1}:`, error.message);
            errorCount++;
          }
        }
      }
    }

    console.log(`✅ Database setup completed!`);
    console.log(`📊 Results: ${successCount} successful, ${errorCount} errors`);
    console.log('🎉 DevTrack Africa database is ready for use!');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

// Run the setup
setupDatabase();

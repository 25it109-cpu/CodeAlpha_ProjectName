// ============================================================
// STEP 1: Define all supported languages
// Each language has a "code" (used by API) and "name" (shown to user)
// ============================================================
const languages = [
  { code: "en", name: "English"    },
  { code: "ta", name: "Tamil"      },
  { code: "hi", name: "Hindi"      },
  { code: "es", name: "Spanish"    },
  { code: "fr", name: "French"     },
  { code: "de", name: "German"     },
  { code: "it", name: "Italian"    },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian"    },
  { code: "zh", name: "Chinese"    },
  { code: "ja", name: "Japanese"   },
  { code: "ko", name: "Korean"     },
  { code: "ar", name: "Arabic"     },
  { code: "te", name: "Telugu"     },
  { code: "ml", name: "Malayalam"  },
  { code: "bn", name: "Bengali"    },
  { code: "ur", name: "Urdu"       },
  { code: "tr", name: "Turkish"    },
  { code: "nl", name: "Dutch"      },
  { code: "vi", name: "Vietnamese" },
];


// ============================================================
// STEP 2: Get references to all HTML elements we need
// ============================================================
const srcLang     = document.getElementById('srcLang');      // source language dropdown
const tgtLang     = document.getElementById('tgtLang');      // target language dropdown
const srcText     = document.getElementById('srcText');      // input textarea
const outputBox   = document.getElementById('outputBox');    // output div
const translateBtn= document.getElementById('translateBtn'); // translate button
const copyBtn     = document.getElementById('copyBtn');      // copy button
const statusEl    = document.getElementById('status');       // status message
const charCount   = document.getElementById('charCount');    // character counter


// ============================================================
// STEP 3: Fill both dropdowns with language options
// ============================================================
languages.forEach(function(lang) {
  // Create one <option> element for source dropdown
  let srcOption = new Option(lang.name, lang.code);
  srcLang.add(srcOption);

  // Create one <option> element for target dropdown
  let tgtOption = new Option(lang.name, lang.code);
  tgtLang.add(tgtOption);
});

// Set default selections
srcLang.value = 'en';   // Source = English by default
tgtLang.value = 'ta';   // Target = Tamil by default


// ============================================================
// STEP 4: Character counter — update as user types
// ============================================================
srcText.addEventListener('input', function() {
  charCount.textContent = srcText.value.length;
});


// ============================================================
// STEP 5: Swap button — swap source and target languages
// ============================================================
document.getElementById('swapBtn').addEventListener('click', function() {
  // Store source language temporarily
  let temp = srcLang.value;

  // Set source = target
  srcLang.value = tgtLang.value;

  // Set target = old source
  tgtLang.value = temp;
});


// ============================================================
// STEP 6: Translate button — main logic
// ============================================================
translateBtn.addEventListener('click', async function() {

  // Get the text the user typed
  let text = srcText.value.trim();

  // Validation: stop if text is empty
  if (text === '') {
    showStatus('Please enter some text first.', 'error');
    return;
  }

  // Validation: stop if source and target are the same language
  if (srcLang.value === tgtLang.value) {
    showStatus('Source and target language must be different.', 'error');
    return;
  }

  // Show loading state
  translateBtn.disabled = true;
  translateBtn.textContent = '⏳ Translating...';
  outputBox.textContent = 'Please wait...';
  copyBtn.disabled = true;
  showStatus('', '');

  // ----------------------------------------------------------
  // STEP 7: Build the API URL
  // We use MyMemory API — free, no API key needed
  // Format: langpair = "en|fr"  (source|target)
  // ----------------------------------------------------------
  let langPair = srcLang.value + '|' + tgtLang.value;
  let apiURL = 'https://api.mymemory.translated.net/get'
             + '?q=' + encodeURIComponent(text)
             + '&langpair=' + langPair;

  // ----------------------------------------------------------
  // STEP 8: Send the request to the API using fetch()
  // ----------------------------------------------------------
  try {
    // Send GET request to the API
    let response = await fetch(apiURL);

    // Convert the response to JSON format
    let data = await response.json();

    // ----------------------------------------------------------
    // STEP 9: Check if translation was successful
    // API returns responseStatus = 200 if success
    // ----------------------------------------------------------
    if (data.responseStatus === 200) {

      // Get the translated text from response
      let translatedText = data.responseData.translatedText;

      // Show translated text in the output box
      outputBox.textContent = translatedText;

      // Save it so copy button can use it
      outputBox.dataset.result = translatedText;

      // Enable the copy button
      copyBtn.disabled = false;

      showStatus('✅ Translation successful!', 'success');

    } else {
      // API returned an error
      outputBox.textContent = 'Translation failed. Please try again.';
      showStatus('API error. Try again.', 'error');
    }

  } catch (error) {
    // Network error (no internet, etc.)
    outputBox.textContent = 'Network error. Check your internet connection.';
    showStatus('Network error.', 'error');
  }

  // Restore translate button back to normal
  translateBtn.disabled = false;
  translateBtn.textContent = '🔁 Translate';
});


// ============================================================
// STEP 10: Copy button — copy translated text to clipboard
// ============================================================
copyBtn.addEventListener('click', function() {

  // Get the saved translated text
  let textToCopy = outputBox.dataset.result;

  if (!textToCopy) return;

  // Use Clipboard API to copy
  navigator.clipboard.writeText(textToCopy).then(function() {
    showStatus('📋 Copied to clipboard!', 'success');

    // Clear the message after 2 seconds
    setTimeout(function() {
      showStatus('', '');
    }, 2000);
  });
});


// ============================================================
// HELPER FUNCTION: Show a status message with color
// ============================================================
function showStatus(message, type) {
  statusEl.textContent = message;
  statusEl.className = type;  // applies 'success' or 'error' CSS class
}
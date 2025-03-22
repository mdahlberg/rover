document.getElementById('save-character').addEventListener('click', function() {
    const character = {
        name: document.getElementById('character-name').value,
        level: document.getElementById('character-level').value,
        stats: {
            strength: document.getElementById('strength').value,
            // Add more stats as needed
        },
        abilities: Array.from(document.querySelectorAll('input[name="ability"]:checked')).map(el => el.value)
    };

    console.log('Character Saved:', character);
    localStorage.setItem('savedCharacter', JSON.stringify(character));
});

document.getElementById('export-character').addEventListener('click', function() {
    // Gather character data from the form
    const character = {
        name: document.getElementById('character-name').value,
        level: document.getElementById('character-level').value,
        stats: {
            strength: document.getElementById('strength').value,
            // Add more stats as needed
        },
        abilities: Array.from(document.querySelectorAll('input[name="ability"]:checked')).map(el => el.value)
    };

    // Convert the object to a JSON string
    const jsonData = JSON.stringify(character, null, 2);

    // Create a Blob containing the JSON data
    const blob = new Blob([jsonData], { type: 'application/json' });

    // Create a temporary download link
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (character.name || "character") + "_data.json";

    // Append to document, trigger download, and remove the element
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});

document.getElementById('load-character').addEventListener('click', function() {
    const fileInput = document.getElementById('import-character');

    if (fileInput.files.length === 0) {
        alert("Please select a JSON file to import.");
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        try {
            const character = JSON.parse(event.target.result);

            // Populate form fields with imported data
            document.getElementById('character-name').value = character.name || '';
            document.getElementById('character-level').value = character.level || '';
            document.getElementById('strength').value = character.stats?.strength || '';

            // Uncheck all ability checkboxes first
            document.querySelectorAll('input[name="ability"]').forEach(el => el.checked = false);

            // Check abilities from the imported data
            if (character.abilities) {
                character.abilities.forEach(ability => {
                    const abilityCheckbox = document.querySelector(`input[name="ability"][value="${ability}"]`);
                    if (abilityCheckbox) {
                        abilityCheckbox.checked = true;
                    }
                });
            }

            console.log('Character Imported:', character);
            alert("Character successfully imported!");
        } catch (error) {
            alert("Invalid JSON file. Please make sure you are importing a valid character file.");
        }
    };

    reader.readAsText(file);
});

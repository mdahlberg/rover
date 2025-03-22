// EXPORT CHARACTER DATA
document.getElementById('export-character').addEventListener('click', function() {
    const character = {
        name: document.getElementById('character-name').value,
        level: document.getElementById('character-level').value,
        stats: {
            strength: document.getElementById('strength').value
        },
        abilities: Array.from(document.querySelectorAll('input[name="ability"]:checked')).map(el => el.value)
    };

    const jsonData = JSON.stringify(character, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });

    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (character.name || "character") + "_data.json";

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});

// IMPORT CHARACTER DATA
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

            document.getElementById('character-name').value = character.name || '';
            document.getElementById('character-level').value = character.level || '';
            document.getElementById('strength').value = character.stats?.strength || '';

            document.querySelectorAll('input[name="ability"]').forEach(el => el.checked = false);
            if (character.abilities) {
                character.abilities.forEach(ability => {
                    const abilityCheckbox = document.querySelector(`input[name="ability"][value="${ability}"]`);
                    if (abilityCheckbox) {
                        abilityCheckbox.checked = true;
                    }
                });
            }

            alert("Character successfully imported!");
        } catch (error) {
            alert("Invalid JSON file. Please make sure you are importing a valid character file.");
        }
    };

    reader.readAsText(file);
});

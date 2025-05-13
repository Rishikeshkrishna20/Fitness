import React, { useState } from 'react';

interface GoalDialogProps {
  onClose: () => void;
}

const GoalDialog: React.FC<GoalDialogProps> = ({ onClose }) => {
  const [goalWeight, setGoalWeight] = useState<number | ''>('');

  const handleSubmit = () => {
    if (goalWeight === '' || goalWeight <= 0) {
      alert('Please enter a valid goal weight.');
      return;
    }

    // Replace this with your actual logic or API call
    console.log(`Goal Weight: ${goalWeight} kg`);
    alert(`Your goal weight: ${goalWeight} kg`);

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-xl font-bold mb-4">Set Your Goal</h2>

        <div className="mb-4">
          <label className="block mb-1 font-medium">What is your target weight?</label>
          <input
            type="number"
            min="1"
            value={goalWeight}
            onChange={(e) =>
              setGoalWeight(e.target.value === '' ? '' : parseFloat(e.target.value))
            }
            className="w-full px-3 py-2 border rounded"
            placeholder="e.g., 65"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalDialog;


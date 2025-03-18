const createScript = async (req, res) => {
    console.log("createScript endpoint hit"); // Debug log
  
    try {
      const { script_name, category, script_code } = req.body;
      const newScript = new Script({
        activity: script_name,
        category,
        tools_technique: script_code,
      });
  
      const savedScript = await newScript.save();
      console.log("Script saved to DB:", savedScript); // Log the saved script
      res.status(201).json({ message: "Script added successfully", script: savedScript });
    } catch (error) {
      console.error("Error creating script:", error);
      res.status(500).json({ message: "Failed to create script", error: error.message });
    }
  };
  
  module.exports = { createScript };
  
// Master Data Controller
// Handles master reference data for the system

export const getMasterData = async (req, res) => {
  try {
    const data = {
      success: true,
      data: [
        { key: 'company_name', value: 'PT PELBIOT', type: 'string' },
        { key: 'version', value: '2.0.0', type: 'string' },
        { key: 'timezone', value: 'Asia/Jakarta', type: 'string' }
      ]
    };
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createMasterData = async (req, res) => {
  try {
    const { key, value, type } = req.body;
    res.json({
      success: true,
      message: 'Master data created',
      data: { id: Math.floor(Math.random() * 1000), key, value, type }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMasterDataByKey = async (req, res) => {
  try {
    const { key } = req.params;
    res.json({
      success: true,
      data: { key, value: 'demo_value', type: 'string' }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

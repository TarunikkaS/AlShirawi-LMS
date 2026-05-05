module.exports = async (req, res) => {
  res.status(200).json({
    supabaseUrl: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
    supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY || '',
    dataApiEnabled: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  });
};

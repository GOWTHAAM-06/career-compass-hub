const supabase = require("../utils/supabaseClient");

exports.register = async (req, res) => {
  try {
    if (!supabase) {
      return res
        .status(500)
        .json({ message: "Supabase not configured. Check backend/.env" });
    }

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (authError) {
      return res.status(400).json({ message: authError.message });
    }

    // The DB trigger (handle_new_user) auto-creates the public.users row.
    // If trigger not installed yet, fallback to manual insert.
    if (authData.user) {
      const { error: insertError } = await supabase
        .from("users")
        .insert({ id: authData.user.id, name, email });

      if (insertError && !insertError.message.includes("duplicate")) {
        console.warn("Profile insert warning:", insertError.message);
      }
    }

    return res.status(201).json({
      message: "Signup successful. Check your email to confirm (if enabled).",
      user: { name, email },
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ message: "Signup failed" });
  }
};

exports.login = async (req, res) => {
  try {
    if (!supabase) {
      return res
        .status(500)
        .json({ message: "Supabase not configured. Check backend/.env" });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Fetch profile from public.users
    const { data: profile } = await supabase
      .from("users")
      .select("id, name, email")
      .eq("id", data.user.id)
      .maybeSingle();

    return res.json({
      token: data.session.access_token,
      user: {
        id: data.user.id,
        name: profile?.name || data.user.user_metadata?.name || "",
        email: data.user.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Login failed" });
  }
};
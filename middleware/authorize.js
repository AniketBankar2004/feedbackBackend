const { getStaffByEmail } = require("../services/rosterService");

// LOCAL DEMO ONLY — never active in production (guarded by NODE_ENV).
function getTestOverrideProfile(email) {
  if (process.env.NODE_ENV === "production") return null;

  const normalized = email.toLowerCase();

  if (
    process.env.TEST_TUTOR_EMAIL &&
    normalized === process.env.TEST_TUTOR_EMAIL.toLowerCase()
  ) {
    return {
      name: process.env.TEST_TUTOR_NAME || "Test Tutor",
      email,
      role: "tutor",
      classes: (process.env.TEST_TUTOR_CLASSES || "").split(",").map((c) => c.trim()),
    };
  }

  if (
    process.env.TEST_COORDINATOR_EMAIL &&
    normalized === process.env.TEST_COORDINATOR_EMAIL.toLowerCase()
  ) {
    return {
      name: process.env.TEST_COORDINATOR_NAME || "Test Coordinator",
      email,
      role: "coordinator",
      classes: [], // coordinators get full access — classes list isn't used for filtering
    };
  }

  return null;
}

async function attachStaffProfile(req, res, next) {
  const email = req.user.email;

  const override = getTestOverrideProfile(email);
  if (override) {
    req.staff = override;
    req.usingTestOverride = true;
    return next();
  }

  const staff = await getStaffByEmail(email);
  if (!staff) {
    return res.status(403).json({ message: "Not on staff roster" });
  }

  req.staff = staff;
  next();
}

function hasFullAccess(staff) {
  return staff.role === "lead" || staff.role === "coordinator";
}

module.exports = { attachStaffProfile, hasFullAccess };
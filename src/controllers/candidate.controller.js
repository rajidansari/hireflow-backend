import pool from '../db/db.js';

const getCandidateProfile = async (req, res) => {
  try {
    const profileResult = await pool.query(
      `
				SELECT
					u.fullname,
					u.email,
					cp.headline,
          cp.description,
					cp.skills,
					cp.location,
					cp.default_cv_url,
					cp.portfolio_url
				FROM users u
				INNER JOIN candidate_profiles cp
				ON u.id = cp.user_id
				WHERE cp.user_id = $1
			`,
      [req.user.userId]
    );

    const profile = profileResult.rows[0];

    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    res.status(200).json(profile);
  } catch (err) {
    console.error(`Failed to fetch candidate profile :: ${err}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// update profile
const updateCandidateProfile = async (req, res) => {
  const { fullname, headline, description, skills, location, portfolioUrl } = req.body;

  const client = await pool.connect();
  try {
    // base update part
    const updates = [];
    const values = [];

    // build dynamic query
    if (headline) {
      values.push(headline);
      updates.push(`headline = $${values.length}`);
    }

    if (description) {
      values.push(description);
      updates.push(`description = $${values.length}`);
    }

    if (skills && skills.length > 0) {
      values.push(skills);
      updates.push(`skills = $${values.length}`);
    }

    if (location) {
      values.push(location);
      updates.push(`location = $${values.length}`);
    }

    if (portfolioUrl) {
      values.push(portfolioUrl);
      updates.push(`portfolio_url = $${values.length}`);
    }

    // return if no fields for update
    if (!fullname && updates.length === 0) {
      return res.status(400).json({ message: 'No fields provided for update' });
    }

    // update clause
    let updateClause = '';
    let profileUpdateQuery = '';

    if (updates.length > 0) {
      updateClause = `SET ${updates.join(', ')}`;

      profileUpdateQuery = `
      UPDATE candidate_profiles
      ${updateClause}
      WHERE user_id = $${values.length + 1}
      RETURNING headline, description, skills, location, portfolio_url, updated_at
      `;
    }

    let fullnameResult = '';
    let profileResult = '';

    await client.query('BEGIN');

    if (fullname) {
      fullnameResult = await client.query(
        `UPDATE users SET fullname = $1 WHERE id = $2 RETURNING fullname`,
        [fullname, req.user.userId]
      );
    } else {
      fullnameResult = await client.query(`SELECT fullname FROM users WHERE id = $1`, [
        req.user.userId,
      ]);
    }

    if (updates.length > 0) {
      profileResult = await client.query(profileUpdateQuery, [...values, req.user.userId]);
    } else {
      profileResult = await client.query(
        `SELECT headline, description, skills, location, portfolio_url, updated_at FROM candidate_profiles WHERE user_id = $1`,
        [req.user.userId]
      );
    }

    await client.query('COMMIT');

    const profile = profileResult.rows[0] || {};

    const finalProfile = { fullname: fullnameResult.rows[0].fullname, ...profile };

    res.status(200).json(finalProfile);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`Failed to update profile information :: ${err}`);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.release();
  }
};

export { getCandidateProfile, updateCandidateProfile };

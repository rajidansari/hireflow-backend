import { rmSync } from 'fs';
import pool from '../db/db.js';

const getEmployerProfile = async (req, res) => {
  try {
    const profileResult = await pool.query(
      `
				SELECT
					u.fullname,
					ep.company_name,
					ep.logo_url,
					ep.website,
					ep.industry,
					ep.bio,
					ep.location
				FROM users u
				INNER JOIN employer_profiles ep
				ON u.id = ep.user_id
				WHERE ep.user_id = $1
			`,
      [req.user.userId]
    );

    if (profileResult.rows.length === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const profile = profileResult.rows[0];

    res.status(200).json(profile);
  } catch (err) {
    console.error(`Failed to fetch employer profile info :: ${err}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// update employer profile
const updateEmployerProfile = async (req, res) => {
  const { fullname, companyName, website, industry, bio, location } = req.body;

  const client = await pool.connect();

  try {
    // base query parts
    const updates = [];
    const values = [];

    if (companyName) {
      values.push(companyName);
      updates.push(`company_name = $${values.length}`);
    }

    if (website) {
      values.push(website);
      updates.push(`website = $${values.length}`);
    }

    if (industry) {
      values.push(industry);
      updates.push(`industry = $${values.length}`);
    }

    if (bio) {
      values.push(bio);
      updates.push(`bio = $${values.length}`);
    }

    if (location) {
      values.push(location);
      updates.push(`location = $${values.length}`);
    }

    // return if no values for update
    if (!fullname && updates.length === 0) {
      return res.status(400).json({ message: 'No fields provided for update' });
    }

    let updateClause = '';
    let profileUpdateQuery = '';

    if (updates.length > 0) {
      updateClause = `SET ${updates.join(', ')}`;

      profileUpdateQuery = `
        UPDATE employer_profiles

        ${updateClause}

        WHERE user_id = $${values.length + 1}

        RETURNING company_name, website, industry, bio, location
      `;
    }

    await client.query('BEGIN');

    let fullnameResult = [];
    let profileResult = [];

    // update fullname
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

    // update profile
    if (updates.length > 0) {
      profileResult = await client.query(profileUpdateQuery, [...values, req.user.userId]);
    } else {
      profileResult = await client.query(
        `SELECT company_name, website, industry, bio, location, updated_at FROM employer_profiles WHERE user_id = $1`,
        [req.user.userId]
      );
    }

    await client.query('COMMIT');

    const profile = profileResult.rows[0];

    const finalProfile = { fullname: fullnameResult.rows[0].fullname, ...profile };

    res.status(200).json(finalProfile);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`Failed to update profile info :: ${err}`);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.release();
  }
};

export { getEmployerProfile, updateEmployerProfile };

function validate(schema) {
	return function (req, res, next) {
		const result = schema.safeParse(req.body || {});

		if(!result.success) {
			const errors = (result.error.issues).map((err) => {
				return {field: err.path[0], message: err.message};
			})
			return res.status(400).json(errors)
		}

		next();
	}
}

export { validate }
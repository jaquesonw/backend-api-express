module.exports = app => {
    const { existsOrError, notExistsOrError } = app.api.validation

    const save = (req, res) => {
        const category = {...req.body}
        if(req.params.id) category.id = req.params.id

        try {
            existsOrError(category.name, 'Nome não informado!')
        } catch(msg) {
            return res.status(400).send(msg)
        }

        if(category.id) {
            app.db('categories')
                .update(category)
                .where({ id: category.id })
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        } else {
            app.db('categories')
                .insert(category)
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        }
    }

    const remove = async (req, res) => {
        try {
            existsOrError(req.params.id, 'Código da Categoria não informado!')

            const subCategory = await app.db('categories')
                .where({ parentId: req.params.id })
            notExistsOrError(subCategory, 'Categoria possui subcategorias')

            const articles = await app.db('articles')
                .where({ categoryId: req.params.id})
            notExistsOrError(articles, 'Categoria possui artigos.')

            const rowsDeleted = await app.db('categories')
                .where({ id: req.params.id }).del()
            existsOrError(rowsDeleted, 'Categoria não foi encontrada')

            res.status(204).send()
        } catch(msg) {
            return res.status(400).send(msg)
        }

        const withPath = categories => {
            const getParent = (categories, ParentId) => {
                const parent = categories.filter(parent => parent.id === ParentId)
                return parent.length ? parent[0] : null
            }

            const categoriesWithPath = categories.map(category => {
                let path = category.name
                let parent = getParent(categories, category.parentId)

                while(parent) {
                    path = `${parent.name}`
                    parent = getParent(categories, parent.parentId)
                }

                return { ...category, path }
            })

            categoriesWithPath.sort((a, b) => {
                if (a.path < b.path) return -1
                if (a.path > b.path) return 1
                return 0
            })

            return categoriesWithPath
        }
    }
}
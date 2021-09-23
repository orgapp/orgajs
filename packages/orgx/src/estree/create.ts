export default function create(template, node) {
  const fields = ['start', 'end', 'loc', 'range', 'comments']
  let index = -1

  while (++index < fields.length) {
    const field = fields[index]

    if (field in template) {
      node[field] = template[field]
    }
  }

  return node
}

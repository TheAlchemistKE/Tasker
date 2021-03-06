import Storage from './Storage';

class Item {
  constructor(data = {}) {
    this.id = parseInt(data.id, 10) || undefined;
    this.title = data.title;
    this.description = data.description;
    this.date = new Date(data.date);
    this.priority = data.priority;
    this.done = data.done === undefined ? false : data.done;
  }

  render() {
    const tr = document.createElement('tr');
    tr.setAttribute('data-id', this.id);

    Object.keys(this).forEach((key) => {
      tr.append(this.renderAttribute(key));
    });

    return tr;
  }

  renderAttribute(attribute) {
    const td = document.createElement('td');
    td.setAttribute('data-attr', attribute);

    const text = Item.formatters(attribute).format(this);
    const classes = Item.formatters(attribute).classList(this);
    if (classes) {
      td.classList.add(classes);
    }
    td.innerHTML = text;

    return td;
  }

  static formatters(attribute) {
    const def = {
      format: (item) => item[attribute],
      classList: () => '',
    };

    const formatters = {
      date: {
        format: (item) => item.date.toISOString().split('T')[0],
      },
      done: {
        classList: (item) => (item.isRead() ? 'green' : 'red'),
        format: (item) => (item.isRead() ? '&check;' : '&times;'),
      },
    };

    return { ...def, ...formatters[attribute] };
  }

  toggle() {
    this.done = !this.done;

    return this;
  }

  save() {
    if (typeof this.id === 'undefined') {
      const keys = Object.keys(Item.all()).concat([0]);
      this.id = Math.max(...keys) + 1;
    }
    Storage.set(this.id, this.literal());
    return this;
  }

  destroy() {
    Storage.destroy(this.id);
  }

  isRead() {
    return this.done;
  }

  literal() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      date: this.date.toISOString().split('T')[0],
      priority: this.priority,
      done: this.done,
    };
  }

  static find(id) {
    const item = Item.all()[id];
    if (item) {
      return Item.hydrate(item);
    }
    return undefined;
  }

  static hydrate(item) {
    return new Item(item);
  }

  static all() {
    const items = Storage.all();
    Object.keys(items).forEach((key) => {
      items[key] = Item.hydrate(items[key]);
    });

    return items;
  }

  static destroy(id) {
    Storage.destroy(id);
  }

  static toArray() {
    return Object.values(Item.all());
  }
}

export default Item;
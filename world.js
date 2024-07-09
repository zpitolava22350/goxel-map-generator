class World {
  constructor() {
    this.chunk = {};
    this.chunkModel = {};
    this.chunkSize = 8;
    this.mapArray = [];
    this.loaded = false;
  }

  generate() {

    for(let b = 0; b < this.mapArray.length; b++){
      this.addBlock(this.mapArray[b][0], this.mapArray[b][1], this.mapArray[b][2], "grass");
    }

    /*
    for (let x in this.chunk) {
      for (let y in this.chunk[x]) {
        for (let z in this.chunk[x][y]) {
          console.log(x, y, z)
        }
      }
    }
      */

    this.compile();

    this.loaded = true;

  }

  collide() {

    let chunksToCheck = [];

    for (let x = -1; x <= 1; x += 2) {
      for (let y = -1; y <= 1; y += 2) {
        for (let z = -1; z <= 1; z += 2) {
          let exists = false;
          let check = this.gc(player.x + (halfWidth * x), player.y + (halfHeight * y), player.z + (halfWidth * z));

          for (let i = 0; i < chunksToCheck.length; i++) {
            if (check[0] === chunksToCheck[i][0] && check[1] === chunksToCheck[i][1] && check[2] === chunksToCheck[i][2]) {
              exists = true;
            }
          }

          if (!exists) {
            chunksToCheck.push([check[0], check[1], check[2]]);
          }
        }
      }
    }

    for (let x = -1; x <= 1; x += 2) {
      for (let y = -1; y <= 1; y += 2) {
        for (let z = -1; z <= 1; z += 2) {
          let exists = false;
          let check = this.gc(player.x + (halfWidth * x) + (player.xVel * deltaTime), player.y + (halfHeight * y) + (player.yVel * deltaTime), player.z + (halfWidth * z) + (player.zVel * deltaTime));

          for (let i = 0; i < chunksToCheck.length; i++) {
            if (check[0] === chunksToCheck[i][0] && check[1] === chunksToCheck[i][1] && check[2] === chunksToCheck[i][2]) {
              exists = true;
            }
          }

          if (!exists) {
            chunksToCheck.push([check[0], check[1], check[2]]);
          }
        }
      }
    }

    //console.log(chunksToCheck.length)

    player.onGround = false;

    for (let c = 0; c < chunksToCheck.length; c++) {
      if (this.chunk[chunksToCheck[c][0]]) {
        if (this.chunk[chunksToCheck[c][0]][chunksToCheck[c][1]]) {
          if (Array.isArray(this.chunk[chunksToCheck[c][0]][chunksToCheck[c][1]][chunksToCheck[c][2]])) {
            let lngth = this.chunk[chunksToCheck[c][0]][chunksToCheck[c][1]][chunksToCheck[c][2]].length;
            for (let b = 0; b < lngth; b++) {
              this.chunk[chunksToCheck[c][0]][chunksToCheck[c][1]][chunksToCheck[c][2]][b].collideFloor();
            }
          }
        }
      }
    }

    for (let c = 0; c < chunksToCheck.length; c++) {
      if (this.chunk[chunksToCheck[c][0]]) {
        if (this.chunk[chunksToCheck[c][0]][chunksToCheck[c][1]]) {
          if (Array.isArray(this.chunk[chunksToCheck[c][0]][chunksToCheck[c][1]][chunksToCheck[c][2]])) {
            let lngth = this.chunk[chunksToCheck[c][0]][chunksToCheck[c][1]][chunksToCheck[c][2]].length;
            for (let b = 0; b < lngth; b++) {
              this.chunk[chunksToCheck[c][0]][chunksToCheck[c][1]][chunksToCheck[c][2]][b].collide();
            }
          }
        }
      }
    }

  }

  // Generalize gc function to handle both (x, y, z) and single num
  gc(x, y, z) {
    x += 0.5;
    y += 0.5;
    z += 0.5;
    if (arguments.length === 3) {
      return [Math.floor(x / this.chunkSize), Math.floor(y / this.chunkSize), Math.floor(z / this.chunkSize)];
    } else if (arguments.length === 1) {
      return Math.floor(x / this.chunkSize);
    }
  }

  doesChunkExist(x, y, z) {
    if (this.chunk[x]) {
      if (this.chunk[x][y]) {
        if (Array.isArray(this.chunk[x][y][z])) {
          return true;
        }
      }
    }
    return false;
  }

  addBlock(x, y, z, tex) {
    let ch = this.gc(x, y, z);

    if (!this.chunk[ch[0]]) {
      this.chunk[ch[0]] = {};
    }
    if (!this.chunk[ch[0]][ch[1]]) {
      this.chunk[ch[0]][ch[1]] = {};
    }
    if (!Array.isArray(this.chunk[ch[0]][ch[1]][ch[2]])) {
      this.chunk[ch[0]][ch[1]][ch[2]] = [];
    }
    if (!this.chunkModel[ch[0]]) {
      this.chunkModel[ch[0]] = {};
    }
    if (!this.chunkModel[ch[0]][ch[1]]) {
      this.chunkModel[ch[0]][ch[1]] = {};
    }
    if (!this.chunkModel[ch[0]][ch[1]][ch[2]]) {
      this.chunkModel[ch[0]][ch[1]][ch[2]] = {};
    }
    this.chunk[ch[0]][ch[1]][ch[2]].push(new Block(x, y, z, tex));
  }

  removeBlock(x, y, z) {
    let ch = this.gc(x, y, z);

    if (this.chunk[ch[0]]) {
      if (this.chunk[ch[0]][ch[1]]) {
        if (Array.isArray(this.chunk[ch[0]][ch[1]][ch[2]])) {
          let temp = this.chunk[ch[0]][ch[1]][ch[2]].length;
          for (let b = temp - 1; b >= 0; b--) {
            if (this.chunk[ch[0]][ch[1]][ch[2]][b].x === x && this.chunk[ch[0]][ch[1]][ch[2]][b].y === y && this.chunk[ch[0]][ch[1]][ch[2]][b].z === z) {
              this.chunk[ch[0]][ch[1]][ch[2]].splice(b, 1);
            }
          }
          this.compileChunk(ch[0], ch[1], ch[2]);
        }
      }
    }
  }

  unloadChunk(x, y, z) {
    scene.remove(this.chunkModel[x][y][z].model);
    this.chunkModel[x][y][z].rendered = false;
  }

  loadChunk(x, y, z) {
    if (!this.chunkModel[x][y][z].rendered) {
      scene.add(this.chunkModel[x][y][z].model);
      this.chunkModel[x][y][z].rendered = true;
    }
  }

  addBlockRaw(x, y, z, tex) {
    let ch = this.gc(x, y, z);
    this.chunk[ch[0]][ch[1]][ch[2]].push(new Block(x, y, z, tex));
  }

  checkForBlock(chunk, x, y, z) {
    let numBlocks = chunk.length;
    for (let i = 0; i < numBlocks; i++) {
      if (chunk[i].x === x && chunk[i].y === y && chunk[i].z === z) {
        return true;
      }
    }
    return false;
  }

  compile() {
    for (let x in this.chunk) {
      for (let y in this.chunk[x]) {
        for (let z in this.chunk[x][y]) {

          if (this.chunkModel[x][y][z].model === undefined) {

          } else {
            scene.remove(this.chunkModel[x][y][z].model);
            this.chunkModel[x][y][z].model.geometry.dispose();
            this.chunkModel[x][y][z].model.material.dispose();
          }

          let vertices = [];
          let indices = [];
          let UVs = [];

          let totalIndices = 0;

          let chunk = this.chunk[x][y][z];

          let lngth = this.chunk[x][y][z].length;

          for (let b = 0; b < lngth; b++) {
            let block = chunk[b];

            // Back (z-)
            if (!this.checkForBlock(chunk, block.x, block.y, block.z - 1)) {
              vertices.push(block.x - 0.5, block.y - 0.5, block.z - 0.5);
              vertices.push(block.x - 0.5, block.y + 0.5, block.z - 0.5);
              vertices.push(block.x + 0.5, block.y + 0.5, block.z - 0.5);
              vertices.push(block.x + 0.5, block.y - 0.5, block.z - 0.5);
              UVs.push(block.lx, block.ly);
              UVs.push(block.lx, block.hy);
              UVs.push(block.hx, block.hy);
              UVs.push(block.hx, block.ly);
              indices.push(0 + totalIndices, 1 + totalIndices, 2 + totalIndices, 0 + totalIndices, 2 + totalIndices, 3 + totalIndices);
              totalIndices += 4;
            }


            // Front (z+)
            if (!this.checkForBlock(chunk, block.x, block.y, block.z + 1)) {
              vertices.push(block.x - 0.5, block.y - 0.5, block.z + 0.5);
              vertices.push(block.x - 0.5, block.y + 0.5, block.z + 0.5);
              vertices.push(block.x + 0.5, block.y + 0.5, block.z + 0.5);
              vertices.push(block.x + 0.5, block.y - 0.5, block.z + 0.5);
              UVs.push(block.lx, block.ly);
              UVs.push(block.lx, block.hy);
              UVs.push(block.hx, block.hy);
              UVs.push(block.hx, block.ly);
              indices.push(0 + totalIndices, 2 + totalIndices, 1 + totalIndices, 0 + totalIndices, 3 + totalIndices, 2 + totalIndices);
              totalIndices += 4;
            }

            // Left (x-)
            if (!this.checkForBlock(chunk, block.x - 1, block.y, block.z)) {
              vertices.push(block.x - 0.5, block.y + 0.5, block.z - 0.5);
              vertices.push(block.x - 0.5, block.y + 0.5, block.z + 0.5);
              vertices.push(block.x - 0.5, block.y - 0.5, block.z + 0.5);
              vertices.push(block.x - 0.5, block.y - 0.5, block.z - 0.5);
              UVs.push(block.hx, block.hy);
              UVs.push(block.lx, block.hy);
              UVs.push(block.lx, block.ly);
              UVs.push(block.hx, block.ly);
              indices.push(2 + totalIndices, 0 + totalIndices, 3 + totalIndices, 2 + totalIndices, 1 + totalIndices, 0 + totalIndices);
              totalIndices += 4;
            }

            // Right (x+)
            if (!this.checkForBlock(chunk, block.x + 1, block.y, block.z)) {
              vertices.push(block.x + 0.5, block.y + 0.5, block.z + 0.5);
              vertices.push(block.x + 0.5, block.y + 0.5, block.z - 0.5);
              vertices.push(block.x + 0.5, block.y - 0.5, block.z - 0.5);
              vertices.push(block.x + 0.5, block.y - 0.5, block.z + 0.5);
              UVs.push(block.hx, block.hy);
              UVs.push(block.lx, block.hy);
              UVs.push(block.lx, block.ly);
              UVs.push(block.hx, block.ly);
              indices.push(0 + totalIndices, 2 + totalIndices, 1 + totalIndices, 0 + totalIndices, 3 + totalIndices, 2 + totalIndices);
              totalIndices += 4;
            }

            // Bottom (y-)
            if (!this.checkForBlock(chunk, block.x, block.y - 1, block.z)) {
              vertices.push(block.x - 0.5, block.y - 0.5, block.z - 0.5);
              vertices.push(block.x - 0.5, block.y - 0.5, block.z + 0.5);
              vertices.push(block.x + 0.5, block.y - 0.5, block.z + 0.5);
              vertices.push(block.x + 0.5, block.y - 0.5, block.z - 0.5);
              UVs.push(block.lx, block.ly);
              UVs.push(block.lx, block.hy);
              UVs.push(block.hx, block.hy);
              UVs.push(block.hx, block.ly);
              indices.push(0 + totalIndices, 3 + totalIndices, 2 + totalIndices, 0 + totalIndices, 2 + totalIndices, 1 + totalIndices);
              totalIndices += 4;
            }

            // Top (y+)
            if (!this.checkForBlock(chunk, block.x, block.y + 1, block.z)) {
              vertices.push(block.x - 0.5, block.y + 0.5, block.z + 0.5);
              vertices.push(block.x - 0.5, block.y + 0.5, block.z - 0.5);
              vertices.push(block.x + 0.5, block.y + 0.5, block.z - 0.5);
              vertices.push(block.x + 0.5, block.y + 0.5, block.z + 0.5);
              UVs.push(block.lx, block.hy);
              UVs.push(block.lx, block.ly);
              UVs.push(block.hx, block.ly);
              UVs.push(block.hx, block.hy);
              indices.push(1 + totalIndices, 3 + totalIndices, 2 + totalIndices, 1 + totalIndices, 0 + totalIndices, 3 + totalIndices);
              totalIndices += 4;
            }
          }

          let vertices2 = new Float32Array(vertices);
          let indices2 = new Uint16Array(indices);
          let UVs2 = new Float32Array(UVs);

          let geometry = new THREE.BufferGeometry();

          geometry.setAttribute('position', new THREE.BufferAttribute(vertices2, 3));
          geometry.setAttribute('uv', new THREE.BufferAttribute(UVs2, 2));
          geometry.setIndex(new THREE.BufferAttribute(indices2, 1));

          geometry.computeVertexNormals();

          let material = new THREE.MeshBasicMaterial({ map: grassTex, side: THREE.FrontSide });
          this.chunkModel[x][y][z].model = new THREE.Mesh(geometry, material);

          scene.add(this.chunkModel[x][y][z].model);
          this.chunkModel[x][y][z].rendered = true;
        }
      }
    }
  }
}